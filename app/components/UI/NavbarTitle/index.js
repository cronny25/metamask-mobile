import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Platform, TouchableOpacity, View, StyleSheet, Text } from 'react-native';
import { colors, fontStyles } from '../../../styles/common';
import Networks from '../../../util/networks';
import { toggleNetworkModal } from '../../../actions/modals';
import { strings } from '../../../../locales/i18n';

const styles = StyleSheet.create({
	wrapper: {
		alignItems: 'center',
		flex: 1
	},
	network: {
		flexDirection: 'row'
	},
	networkName: {
		fontSize: 11,
		color: colors.gray,
		...fontStyles.normal
	},
	networkIcon: {
		width: 5,
		height: 5,
		borderRadius: 100,
		marginRight: 5,
		marginTop: Platform.OS === 'ios' ? 4 : 5
	},
	title: {
		fontSize: 18,
		...fontStyles.normal
	},
	otherNetworkIcon: {
		backgroundColor: colors.transparent,
		borderColor: colors.borderColor,
		borderWidth: 1
	}
});

/**
 * UI Component that renders inside the navbar
 * showing the view title and the selected network
 */
class NavbarTitle extends Component {
	static propTypes = {
		/**
		 * Object representing the selected the selected network
		 */
		network: PropTypes.object.isRequired,
		/**
		 * Name of the current view
		 */
		title: PropTypes.string,
		/**
		 * Action that toggles the network modal
		 */
		toggleNetworkModal: PropTypes.func,
		/**
		 * Boolean that specifies if the title needs translation
		 */
		translate: PropTypes.bool,
		/**
		 * Boolean that specifies if the network can be changed
		 */
		disableNetwork: PropTypes.bool
	};

	static defaultProps = {
		translate: true
	};

	openNetworkList = () => {
		if (!this.props.disableNetwork) {
			this.props.toggleNetworkModal();
		}
	};

	render = () => {
		const { network, title, translate } = this.props;
		const { color, name } = Networks[network.provider.type] || { ...Networks.rpc, color: null };
		const realTitle = translate ? strings(title) : title;

		return (
			<TouchableOpacity
				onPress={this.openNetworkList}
				style={styles.wrapper}
				activeOpacity={this.props.disableNetwork ? 1 : 0.2}
			>
				{title ? <Text style={styles.title}>{realTitle}</Text> : null}
				<View style={styles.network}>
					<View style={[styles.networkIcon, color ? { backgroundColor: color } : styles.otherNetworkIcon]} />
					<Text style={styles.networkName} testID={'navbar-title-network'}>
						{name}
					</Text>
				</View>
			</TouchableOpacity>
		);
	};
}

const mapStateToProps = state => ({
	network: state.engine.backgroundState.NetworkController
});
const mapDispatchToProps = dispatch => ({
	toggleNetworkModal: () => dispatch(toggleNetworkModal())
});
export default connect(
	mapStateToProps,
	mapDispatchToProps
)(NavbarTitle);
