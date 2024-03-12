import { Alert, AlertTitle, Box, Button } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';

const PromptErrorMessage = ( { error, onRetry = () => {}, actionPosition = 'default', ...props } ) => {
	function getQuotaReachedTrailMessage( featureKey ) {
		const messageByFeature = {
			default: {
				text: <AlertTitle>{ __( 'It\'s time to upgrade.', 'elementor' ) }</AlertTitle>,
				description: __( 'Enjoy the free trial? Upgrade now for unlimited access to built-in image, text and custom code generators.', 'elementor' ),
				buttonText: __( 'Upgrade', 'elementor' ),
				buttonAction: () => window.open( 'https://go.elementor.com/ai-popup-purchase-limit-reached/', '_blank' ),
			},
			text: {
				text: <AlertTitle>{ __( 'It\'s time to upgrade.', 'elementor' ) }</AlertTitle>,
				description: __( 'Enjoy generating texts? Upgrade now for unlimited access.', 'elementor' ),
				buttonText: __( 'Upgrade', 'elementor' ),
				buttonAction: () => window.open( 'https://go.elementor.com/ai-popup-purchase-limit-reached/text', '_blank' ),
			},
		};
		return messageByFeature[ featureKey ] || messageByFeature.default;
	}

	function getErrorMessage() {
		const errMsg = error.message || error;
		const featureKey = error.extra_data?.featureKey;

		const messages = {
			default: {
				text: <AlertTitle>{ __( 'Unknown error. Please try again later.', 'elementor' ) }</AlertTitle>,
				description: __( 'Error code:', 'elementor' ) + ' ' + error,
				buttonText: __( 'Try Again', 'elementor' ),
				buttonAction: onRetry,
			},
			service_outage_internal: {
				text: <AlertTitle>{ __( 'Elementor AI is temporarily unavailable', 'elementor' ) }</AlertTitle>,
				description: __( 'Seems like we are experiencing technical difficulty. We should be up and running shortly.', 'elementor' ),
				buttonText: __( 'Try Again', 'elementor' ),
				buttonAction: onRetry,
			},
			invalid_connect_data: {
				text: <AlertTitle>{ __( 'Reconnect your account', 'elementor' ) }</AlertTitle>,
				description: (
					<>
						{ __( 'We couldn\'t connect to your account due to technical difficulties on our end. Reconnect your account to continue.', 'elementor' ) }
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
			quota_reached_trail: getQuotaReachedTrailMessage( featureKey ),
			quota_reached_subscription: {
				text: <AlertTitle>{ __( 'It\'s time to upgrade.', 'elementor' ) }</AlertTitle>,
				description: __( 'Love Elementor AI? Upgrade to continue creating with built-in image, text and custom code generators.', 'elementor' ),
				buttonText: __( 'Upgrade', 'elementor' ),
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
	error: PropTypes.string,
	onRetry: PropTypes.func,
	actionPosition: PropTypes.oneOf( [ 'default', 'bottom' ] ),
};

export default PromptErrorMessage;
