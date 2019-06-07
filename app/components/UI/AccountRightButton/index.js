import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Platform, TouchableOpacity, StyleSheet } from 'react-native';
import Identicon from '../Identicon';
import { toggleAccountsModal } from '../../../actions/modals';

const styles = StyleSheet.create({
	leftButton: {
		marginTop: 12,
		marginRight: Platform.OS === 'android' ? 7 : 18,
		marginLeft: Platform.OS === 'android' ? 7 : 0,
		marginBottom: 12,
		alignItems: 'center',
		justifyContent: 'center'
	}
});

/**
 * UI Component that renders on the top right of the navbar
 * showing an identicon for the selectedAddress
 */
class AccountRightButton extends Component {
	static propTypes = {
		/**
		 * Selected address as string
		 */
		address: PropTypes.string,
		/**
		 * Action that toggles the account modal
		 */
		toggleAccountsModal: PropTypes.func
	};

	animating = false;

	toggleAccountsModal = () => {
		if (!this.animating) {
			this.animating = true;
			this.props.toggleAccountsModal();
			setTimeout(() => {
				this.animating = false;
			}, 500);
		}
	};

	render = () => {
		const { address } = this.props;
		return (
			<TouchableOpacity
				style={styles.leftButton}
				onPress={this.toggleAccountsModal}
				testID={'navbar-account-button'}
			>
				<Identicon diameter={28} address={address} />
			</TouchableOpacity>
		);
	};
}

const mapStateToProps = state => ({ address: state.engine.backgroundState.PreferencesController.selectedAddress });
const mapDispatchToProps = dispatch => ({
	toggleAccountsModal: () => dispatch(toggleAccountsModal())
});
export default connect(
	mapStateToProps,
	mapDispatchToProps
)(AccountRightButton);
