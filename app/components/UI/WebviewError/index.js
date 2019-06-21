import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Platform, Image, StyleSheet, View, Text } from 'react-native';
import AnimatedFox from 'react-native-animated-fox';
import StyledButton from '../StyledButton';
import { strings } from '../../../../locales/i18n';
import { fontStyles, colors } from '../../../styles/common';

const styles = StyleSheet.create({
	wrapper: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: colors.white,
		justifyContent: 'center',
		alignItems: 'center'
	},
	foxWrapper: {
		backgroundColor: colors.white,
		marginTop: -100,
		width: 110,
		marginBottom: 20,
		height: 110
	},
	textWrapper: {
		width: 300,
		justifyContent: 'center',
		alignItems: 'center'
	},
	image: {
		alignSelf: 'center',
		width: 110,
		height: 110
	},
	errorTitle: {
		color: colors.fontPrimary,
		...fontStyles.bold,
		fontSize: 18,
		marginBottom: 15
	},
	errorMessage: {
		textAlign: 'center',
		color: colors.fontSecondary,
		...fontStyles.normal,
		fontSize: 14,
		marginBottom: 10
	},
	errorInfo: {
		color: colors.fontTertiary,
		...fontStyles.normal,
		fontSize: 12
	},
	buttonWrapper: {
		width: 120,
		marginTop: 30
	}
});

/**
 * View that renders custom error page for the browser
 */
export default class WebviewError extends Component {
	static propTypes = {
		/**
		 * error info
		 */
		error: PropTypes.object,
		/**
		 * Function that reloads the page
		 */
		onReload: PropTypes.func
	};

	onReload = () => {
		this.props.onReload();
	};

	render() {
		const { error } = this.props;
		if (!error) {
			return null;
		}
		return (
			<View style={styles.wrapper}>
				<View style={styles.foxWrapper}>
					{Platform.OS === 'android' ? (
						<Image source={require('../../../images/fox.png')} style={styles.image} resizeMethod={'auto'} />
					) : (
						<AnimatedFox />
					)}
				</View>
				<View style={styles.textWrapper}>
					<Text style={styles.errorTitle}>{strings('webview_error.title')}</Text>
					<Text style={styles.errorMessage}>{strings('webview_error.message')}</Text>
					{error.description ? (
						<Text style={styles.errorInfo}>{`${strings('webview_error.reason')}: ${
							error.description
						}`}</Text>
					) : null}
				</View>
				<View style={styles.buttonWrapper}>
					<StyledButton type={'confirm'} onPress={this.onReload}>
						{strings('webview_error.try_again')}
					</StyledButton>
				</View>
			</View>
		);
	}
}
