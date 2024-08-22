import { Alert, AlertTitle, Box, Button } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';

const PromptErrorMessage = ( { error, onRetry = () => {}, actionPosition = 'default', ...props } ) => {
	function getQuotaReachedTrailMessage( featureName ) {
		if ( ! featureName ) {
			return {
				text: <AlertTitle>{ __( 'It\'s time to upgrade.', 'elementor' ) }</AlertTitle>,
				description: __( 'Enjoy the free trial? Upgrade now for unlimited access to built-in image, text and custom code generators.', 'elementor' ),
				buttonText: __( 'Upgrade', 'elementor' ),
				buttonAction: () => window.open( 'https://go.elementor.com/ai-popup-purchase-limit-reached/', '_blank' ),
			};
		}

		return {
			// Translators: %s is the feature name.
			text: <AlertTitle>{ sprintf( __( 'You\'ve used all AI credits for %s.', 'elementor' ), featureName.toLowerCase() ) }</AlertTitle>,
			description: __( 'Upgrade now to keep using this feature. You still have credits for other AI features (Text, Code, Images, Containers, etc.)', 'elementor' ),
			buttonText: __( 'Upgrade now', 'elementor' ),
			buttonAction: () => window.open( 'https://go.elementor.com/ai-popup-purchase-limit-reached/', '_blank' ),
		};
	}

	function getErrorMessage() {
		const errMsg = error.message || error;
		const featureName = error.extra_data?.featureName;

		const messages = {
			default: {
				text: <AlertTitle>{ __( 'There was a glitch.', 'elementor' ) }</AlertTitle>,
				description: __( 'Wait a moment and give it another go, or try tweaking the prompt.', 'elementor' ),
				buttonText: __( 'Try again', 'elementor' ),
				buttonAction: onRetry,
			},
			service_outage_internal: {
				text: <AlertTitle>{ __( 'There was a glitch.', 'elementor' ) }</AlertTitle>,
				description: __( 'Wait a moment and give it another go.', 'elementor' ),
				buttonText: __( 'Try again', 'elementor' ),
				buttonAction: onRetry,
			},
			invalid_connect_data: {
				text: <AlertTitle>{ __( 'There was a glitch.', 'elementor' ) }</AlertTitle>,
				description: (
					<>
						{ __( 'Try exiting Elementor and sign in again.', 'elementor' ) }
						{ ' ' }<a href="https://elementor.com/help/disconnecting-reconnecting-your-elementor-account/" target="_blank" rel="noreferrer">{ __( 'Show me how', 'elementor' ) }</a>
					</>
				),
				buttonText: __( 'Reconnect', 'elementor' ),
				buttonAction: () => window.open( window.ElementorAiConfig.connect_url ),
			},
			not_connected: {
				text: <AlertTitle>{ __( 'You aren\'t connected to Elementor AI.', 'elementor' ) }</AlertTitle>,
				description: __( 'Elementor AI is just a few clicks away. Connect your account to instantly create texts and custom code.', 'elementor' ),
				buttonText: __( 'Connect', 'elementor' ),
				buttonAction: () => window.open( window.ElementorAiConfig.connect_url ),
			},
			quota_reached_trail: getQuotaReachedTrailMessage( featureName ),
			quota_reached_subscription: {
				text: <AlertTitle>{ __( 'Looks like you\'re out of credits.', 'elementor' ) }</AlertTitle>,
				description: __( 'Ready to take it to the next level?', 'elementor' ),
				buttonText: __( 'Upgrade now', 'elementor' ),
				buttonAction: () => window.open( 'https://go.elementor.com/ai-popup-purchase-limit-reached/', '_blank' ),
			},
			rate_limit_network: {
				text: <AlertTitle>{ __( 'Whoa! Slow down there.', 'elementor' ) }</AlertTitle>,
				description: __( 'We can’t process that many requests so fast. Try again in 15 minutes.', 'elementor' ),
			},
			invalid_prompts: {
				text: <AlertTitle>{ __( 'We were unable to generate that prompt.', 'elementor' ) }</AlertTitle>,
				description: __( 'Seems like the prompt contains words that could generate harmful content. Write a different prompt to continue.', 'elementor' ),
			},
			service_unavailable: {
				text: <AlertTitle>{ __( 'There was a glitch.', 'elementor' ) }</AlertTitle>,
				description: __( 'Wait a moment and give it another go, or try tweaking the prompt.', 'elementor' ),
				buttonText: __( 'Try again', 'elementor' ),
				buttonAction: onRetry,
			},
			request_timeout_error: {
				text: <AlertTitle>{ __( 'There was a glitch.', 'elementor' ) }</AlertTitle>,
				description: __( 'Wait a moment and give it another go, or try tweaking the prompt.', 'elementor' ),
				buttonText: __( 'Try again', 'elementor' ),
				buttonAction: onRetry,
			},
			invalid_token: {
				text: <AlertTitle>{ __( 'Try again', 'elementor' ) }</AlertTitle>,
				description: __( 'Try exiting Elementor and sign in again.', 'elementor' ),
				buttonText: __( 'Reconnect', 'elementor' ),
				buttonAction: onRetry,
			},
			file_too_large: {
				text: <AlertTitle>{ __( 'The file is too large.', 'elementor' ) }</AlertTitle>,
				description: __( 'Please upload a file that is less than 4MB.', 'elementor' ),
			},
		};

		return messages[ errMsg ] || messages.default;
	}

	const message = getErrorMessage();

	const action = message?.buttonText && (
		<Button
			color="inherit"
			size="small"
			variant="outlined"
			onClick={ message.buttonAction }
		>
			{ message.buttonText }
		</Button>
	);

	return (
		<Alert
			severity={ message.severity || 'error' }
			action={ 'default' === actionPosition && action }
			{ ...props }
		>
			{ message.text }
			{ message.description }
			{ 'bottom' === actionPosition && <Box sx={ { mt: 1 } }>{ action }</Box> }
		</Alert>
	);
};

PromptErrorMessage.propTypes = {
	error: PropTypes.oneOfType( [
		PropTypes.object,
		PropTypes.string,
	] ),
	onRetry: PropTypes.func,
	actionPosition: PropTypes.oneOf( [ 'default', 'bottom' ] ),
};

export default PromptErrorMessage;
