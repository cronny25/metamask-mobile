import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { SafeAreaView, ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
import { withNavigation } from 'react-navigation';
import { colors, fontStyles } from '../../styles/common';
import Engine from '../../core/Engine';
import TransactionEditor from '../TransactionEditor';
import NavbarTitle from '../NavbarTitle';
import { toBN, BNToHex, hexToBN } from '../../util/number';
import { toChecksumAddress } from 'ethereumjs-util';
import { strings } from '../../../locales/i18n';

const styles = StyleSheet.create({
	wrapper: {
		backgroundColor: colors.white,
		flex: 1
	},
	loader: {
		backgroundColor: colors.white,
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center'
	}
});

/**
 * View that wraps the wraps the "Send" screen
 */
class SendScreen extends Component {
	static navigationOptions = {
		headerTitle: <NavbarTitle title={strings('send.title')} />,
		headerTruncatedBackTitle: strings('navigation.back'),
		headerBackTitle: strings('navigation.back'),
		headerTitleStyle: {
			fontSize: 20,
			...fontStyles.normal
		}
	};

	static propTypes = {
		/**
		 * Object that represents the navigator
		 */
		navigation: PropTypes.object
	};

	state = {
		mode: 'edit',
		transaction: undefined,
		transactionKey: undefined,
		ready: false,
		transactionConfirmed: false,
		transactionSubmitted: false
	};

	mounted = false;

	async reset() {
		const { navigation } = this.props;
		const asset = navigation.state && navigation.state && navigation.state.params;
		const transaction = { asset };
		const { gas, gasPrice } = await Engine.context.TransactionController.estimateGas(transaction);
		transaction.gas = hexToBN(gas);
		transaction.gasPrice = hexToBN(gasPrice);
		return this.mounted && this.setState({ mode: 'edit', transaction, transactionKey: Date.now() });
	}

	checkForDeeplinks() {
		const { navigation } = this.props;
		if (navigation) {
			const txMeta = navigation.getParam('txMeta', null);
			if (txMeta) {
				this.handleNewTxMeta(txMeta);
			}
		}

		this.mounted && this.setState({ ready: true });
	}

	async componentDidMount() {
		this.mounted = true;
		await this.reset();
		this.checkForDeeplinks();
	}

	async componentWillUnmount() {
		const { transaction, transactionSubmitted } = this.state;
		if (!transactionSubmitted) {
			transaction && (await this.onCancel(transaction.id));
		}
		this.mounted = false;
	}

	componentDidUpdate(prevProps) {
		const prevNavigation = prevProps.navigation;
		const { navigation } = this.props;
		if (prevNavigation && navigation) {
			const prevTxMeta = prevNavigation.getParam('txMeta', null);
			const currentTxMeta = navigation.getParam('txMeta', null);
			if (
				currentTxMeta &&
				currentTxMeta.source &&
				(!prevTxMeta.source || prevTxMeta.source !== currentTxMeta.source)
			) {
				this.handleNewTxMeta(currentTxMeta);
			}
		}
	}

	handleNewTxMeta = ({
		target_address,
		chain_id = null, // eslint-disable-line no-unused-vars
		function_name = null, // eslint-disable-line no-unused-vars
		parameters = null
	}) => {
		const newTxMeta = { ...this.state.transaction };
		newTxMeta.to = toChecksumAddress(target_address);

		if (parameters) {
			const { value, gas, gasPrice } = parameters;
			if (value) {
				newTxMeta.value = toBN(value);
			}
			if (gas) {
				newTxMeta.gas = toBN(gas);
			}
			if (gasPrice) {
				newTxMeta.gasPrice = toBN(gas);
			}

			// TODO: We should add here support for sending tokens
			// or calling smart contract functions
		}
		this.mounted && this.setState({ transaction: newTxMeta });
	};

	prepareTransaction(transaction) {
		transaction.gas = BNToHex(transaction.gas);
		transaction.gasPrice = BNToHex(transaction.gasPrice);
		transaction.value = BNToHex(transaction.value);
		return transaction;
	}

	prepareTokenTransaction = (transaction, asset) => {
		transaction.gas = BNToHex(transaction.gas);
		transaction.gasPrice = BNToHex(transaction.gasPrice);
		transaction.value = '0x0';
		transaction.to = asset.address;
		return transaction;
	};

	sanitizeTransaction(transaction) {
		transaction.gas = hexToBN(transaction.gas);
		transaction.gasPrice = hexToBN(transaction.gasPrice);
		return transaction;
	}

	onCancel = id => {
		Engine.context.TransactionController.cancelTransaction(id);
		if (this.state.mode !== 'edit') {
			this.props.navigation.pop(2);
		} else {
			this.props.navigation.goBack();
		}
	};

	onConfirm = async (transaction, asset) => {
		const { TransactionController } = Engine.context;
		this.setState({ transactionConfirmed: true });
		try {
			if (!asset) {
				transaction = this.prepareTransaction(transaction);
			} else {
				transaction = this.prepareTokenTransaction(transaction, asset);
			}
			const { result, transactionMeta } = await TransactionController.addTransaction(transaction);
			await TransactionController.approveTransaction(transactionMeta.id);
			const hash = await result;
			this.props.navigation.push('TransactionSubmitted', { hash });
			this.reset();
			this.setState({ transactionConfirmed: false, transactionSubmitted: true });
		} catch (error) {
			Alert.alert('Transaction error', JSON.stringify(error), [{ text: 'OK' }]);
			this.setState({ transactionConfirmed: false });
			this.reset();
		}
	};

	onModeChange = mode => {
		this.mounted && this.setState({ mode });
	};

	renderLoader() {
		return (
			<View style={styles.loader}>
				<ActivityIndicator size="small" />
			</View>
		);
	}

	render = () => (
		<SafeAreaView style={styles.wrapper}>
			{this.state.ready ? (
				<TransactionEditor
					navigation={this.props.navigation}
					mode={this.state.mode}
					onCancel={this.onCancel}
					onConfirm={this.onConfirm}
					onModeChange={this.onModeChange}
					transaction={this.state.transaction}
					transactionConfirmed={this.state.transactionConfirmed}
				/>
			) : (
				this.renderLoader()
			)}
		</SafeAreaView>
	);
}

export default withNavigation(SendScreen);
