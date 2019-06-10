import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Clipboard, Platform, ScrollView, TextInput, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { colors, fontStyles, baseStyles } from '../../../styles/common';
import Identicon from '../Identicon';
import Engine from '../../../core/Engine';
import { setTokensTransaction } from '../../../actions/transaction';
import { connect } from 'react-redux';
import { renderFiat } from '../../../util/number';
import { renderAccountName, renderShortAddress } from '../../../util/address';
import { showAlert } from '../../../actions/alert';
import { strings } from '../../../../locales/i18n';
import { toggleAccountsModal } from '../../../actions/modals';

const styles = StyleSheet.create({
	scrollView: {
		maxHeight: Platform.OS === 'ios' ? 210 : 220,
		backgroundColor: colors.white
	},
	wrapper: {
		maxHeight: Platform.OS === 'ios' ? 210 : 220,
		paddingTop: 20,
		paddingHorizontal: 20,
		paddingBottom: 0,
		alignItems: 'center'
	},
	info: {
		justifyContent: 'center',
		alignItems: 'center',
		textAlign: 'center'
	},
	data: {
		textAlign: 'center',
		paddingTop: 7
	},
	label: {
		fontSize: 24,
		textAlign: 'center',
		...fontStyles.normal
	},
	labelInput: {
		marginBottom: Platform.OS === 'android' ? -10 : 0
	},
	addressWrapper: {
		backgroundColor: colors.blue000,
		borderRadius: 40,
		marginTop: 20,
		marginBottom: 20,
		paddingVertical: 7,
		paddingHorizontal: 15
	},
	address: {
		fontSize: 12,
		color: colors.grey400,
		...fontStyles.normal,
		letterSpacing: 0.8
	},
	amountFiat: {
		fontSize: 12,
		paddingTop: 5,
		color: colors.fontSecondary,
		...fontStyles.normal
	},
	identiconBorder: {
		borderRadius: 80,
		borderWidth: 2,
		padding: 2,
		borderColor: colors.blue
	},
	onboardingWizardLabel: {
		borderWidth: 2,
		borderRadius: 4,
		paddingVertical: Platform.OS === 'ios' ? 2 : -4,
		paddingHorizontal: Platform.OS === 'ios' ? 5 : 5,
		top: Platform.OS === 'ios' ? 0 : -2
	}
});

/**
 * View that's part of the <Wallet /> component
 * which shows information about the selected account
 */
class AccountOverview extends Component {
	static propTypes = {
		/**
		 * String that represents the selected address
		 */
		selectedAddress: PropTypes.string,
		/**
		/* Identities object required to get account name
		*/
		identities: PropTypes.object,
		/**
		 * Object that represents the selected account
		 */
		account: PropTypes.object,
		/**
		/* Selected currency
		*/
		currentCurrency: PropTypes.string,
		/**
		/* Triggers global alert
		*/
		showAlert: PropTypes.func,
		/**
		 * Action that toggles the accounts modal
		 */
		toggleAccountsModal: PropTypes.func,
		/**
		 * whether component is being rendered from onboarding wizard
		 */
		onboardingWizard: PropTypes.bool,
		/**
		 * Used to get child ref
		 */
		onRef: PropTypes.func
	};

	state = {
		accountLabelEditable: false,
		accountLabel: '',
		originalAccountLabel: ''
	};

	editableLabelRef = React.createRef();
	scrollViewContainer = React.createRef();
	mainView = React.createRef();

	animatingAccountsModal = false;

	toggleAccountsModal = () => {
		const { onboardingWizard } = this.props;
		if (!onboardingWizard && !this.animatingAccountsModal) {
			this.animatingAccountsModal = true;
			this.props.toggleAccountsModal();
			setTimeout(() => {
				this.animatingAccountsModal = false;
			}, 500);
		}
	};

	input = React.createRef();

	componentDidMount = () => {
		const { identities, selectedAddress, onRef } = this.props;
		const accountLabel = renderAccountName(selectedAddress, identities);
		this.setState({ accountLabel });
		onRef && onRef(this);
	};

	setAccountLabel = () => {
		const { PreferencesController } = Engine.context;
		const { selectedAddress } = this.props;
		const { accountLabel } = this.state;
		PreferencesController.setAccountLabel(selectedAddress, accountLabel);
		this.setState({ accountLabelEditable: false });
	};

	onAccountLabelChange = accountLabel => {
		this.setState({ accountLabel });
	};

	setAccountLabelEditable = () => {
		const { identities, selectedAddress } = this.props;
		const accountLabel = renderAccountName(selectedAddress, identities);
		this.setState({ accountLabelEditable: true, accountLabel });
		setTimeout(() => {
			this.input && this.input.current && this.input.current.focus();
		}, 100);
	};

	cancelAccountLabelEdition = () => {
		const { identities, selectedAddress } = this.props;
		const accountLabel = renderAccountName(selectedAddress, identities);
		this.setState({ accountLabelEditable: false, accountLabel });
	};

	copyAccountToClipboard = async () => {
		const { selectedAddress } = this.props;
		await Clipboard.setString(selectedAddress);
		this.props.showAlert({
			isVisible: true,
			autodismiss: 1500,
			content: 'clipboard-alert',
			data: { msg: strings('account_details.account_copied_to_clipboard') }
		});
	};

	render() {
		const {
			account: { name, address },
			currentCurrency,
			onboardingWizard
		} = this.props;

		const fiatBalance = `${renderFiat(Engine.getTotalFiatAccountBalance(), currentCurrency)}`;

		if (!address) return null;
		const { accountLabelEditable, accountLabel } = this.state;

		return (
			<View style={baseStyles.flexGrow} ref={this.scrollViewContainer} collapsable={false}>
				<ScrollView
					bounces={false}
					keyboardShouldPersistTaps={'never'}
					style={styles.scrollView}
					contentContainerStyle={styles.wrapper}
					testID={'account-overview'}
				>
					<View style={styles.info} ref={this.mainView}>
						<TouchableOpacity
							style={styles.identiconBorder}
							disabled={onboardingWizard}
							onPress={this.toggleAccountsModal}
						>
							<Identicon address={address} size="38" noFadeIn={onboardingWizard} />
						</TouchableOpacity>
						<View ref={this.editableLabelRef} style={styles.data} collapsable={false}>
							{accountLabelEditable ? (
								<TextInput
									style={[
										styles.label,
										styles.labelInput,
										styles.onboardingWizardLabel,
										onboardingWizard ? { borderColor: colors.blue } : { borderColor: colors.white }
									]}
									editable={accountLabelEditable}
									onChangeText={this.onAccountLabelChange}
									onSubmitEditing={this.setAccountLabel}
									onBlur={this.setAccountLabel}
									testID={'account-label-text-input'}
									value={accountLabel}
									selectTextOnFocus
									ref={this.input}
									returnKeyType={'done'}
									autoCapitalize={'none'}
									autoCorrect={false}
									numberOfLines={1}
								/>
							) : (
								<TouchableOpacity onLongPress={this.setAccountLabelEditable}>
									<Text
										style={[
											styles.label,
											styles.onboardingWizardLabel,
											onboardingWizard
												? { borderColor: colors.blue }
												: { borderColor: colors.white }
										]}
										numberOfLines={1}
									>
										{name}
									</Text>
								</TouchableOpacity>
							)}
						</View>
						<Text style={styles.amountFiat}>{fiatBalance}</Text>
						<TouchableOpacity style={styles.addressWrapper} onPress={this.copyAccountToClipboard}>
							<Text style={styles.address}>{renderShortAddress(address)}</Text>
						</TouchableOpacity>
					</View>
				</ScrollView>
			</View>
		);
	}
}

const mapStateToProps = state => ({
	selectedAddress: state.engine.backgroundState.PreferencesController.selectedAddress,
	identities: state.engine.backgroundState.PreferencesController.identities
});

const mapDispatchToProps = dispatch => ({
	setTokensTransaction: asset => dispatch(setTokensTransaction(asset)),
	showAlert: config => dispatch(showAlert(config)),
	toggleAccountsModal: () => dispatch(toggleAccountsModal())
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(AccountOverview);
