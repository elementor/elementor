import { Alert, Button, AlertTitle } from '@elementor/ui';

const PromptErrorMessage = ( { error, onRetry = () => {}, ...props } ) => {
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
		},
		not_connected: {
			text: <AlertTitle>{ __( 'You aren\'t connected to Elementor AI.', 'elementor' ) }</AlertTitle>,
			description: __( 'Elementor AI is just a few clicks away. Connect your account to instantly create texts and custom code.', 'elementor' ),
		},
		quota_reached_trail: {
			severity: 'info',
			text: <AlertTitle>{ __( 'It\'s time to upgrade.', 'elementor' ) }</AlertTitle>,
			description: __( 'Enjoy the free trial? Upgrade now for unlimited access to built-in text and custom code generators.', 'elementor' ),
			buttonText: __( 'Upgrade', 'elementor' ),
			buttonAction: () => window.open( 'https://go.elementor.com/ai-popup-purchase-limit-reached/', '_blank' ),
		},
		quota_reached_subscription: {
			severity: 'info',
			text: <AlertTitle>{ __( 'It\'s time to upgrade.', 'elementor' ) }</AlertTitle>,
			description: __( 'Love Elementor AI? Upgrade to continue creating with built-in text and custom code generators.', 'elementor' ),
			buttonText: __( 'Upgrade', 'elementor' ),
			buttonAction: () => window.open( 'https://go.elementor.com/ai-popup-purchase-limit-reached/', '_blank' ),
		},
		rate_limit_network: {
			text: <AlertTitle>{ __( 'Whoa! Slow down there.', 'elementor' ) }</AlertTitle>,
			description: __( 'We can’t process that many requests so fast. Try again in 15 minutes.', 'elementor' ),
		},
	};

	const message = messages[ error ] || messages.default;

	return (
		<Alert
			severity={ message.severity || 'error' }
			action={ message?.buttonText && (
				<Button
					color="inherit"
					size="small"
					variant="outlined"
					onClick={ message.buttonAction }
					sx={ {
						height: 'auto',
						// TODO: Fix in UI library.
						minHeight: '32px',
					} }
				>
					{ message.buttonText }
				</Button>
			) }
			{ ...props }
		>
			{ message.text }
			{ message.description }
		</Alert>
	);
};

PromptErrorMessage.propTypes = {
	error: PropTypes.string,
	onRetry: PropTypes.func,
};

export default PromptErrorMessage;
