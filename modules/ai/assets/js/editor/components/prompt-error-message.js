import { Alert, Button } from '@elementor/ui';

const PromptErrorMessage = ( { error, onRetry = () => {}, ...props } ) => {
	const messages = {
		default: {
			text: <h3>{ __( 'Unknown error. Please try again later.', 'elementor' ) }</h3>,
			description: __( 'Error code:', 'elementor' ) + ' ' + error,
			buttonText: __( 'Try Again', 'elementor' ),
			buttonAction: onRetry,
		},
		service_outage_internal: {
			text: <h3>{ __( 'Elementor AI is temporarily unavailable', 'elementor' ) }</h3>,
			description: __( 'Seems like we are experiencing technical difficulty. We should be up and running shortly.', 'elementor' ),
			buttonText: __( 'Try Again', 'elementor' ),
			buttonAction: onRetry,
		},
		invalid_connect_data: {
			text: <h3>{ __( 'Reconnect your account', 'elementor' ) }</h3>,
			description: (
				<>
					{ __( 'We couldn\'t connect to your account due to technical difficulties on our end. Reconnect your account to continue.', 'elementor' ) }
					{ ' ' }<a href="https://elementor.com/help/disconnecting-reconnecting-your-elementor-account/" target="_blank">{ __( 'Show me how', 'elementor' ) }</a>
				</>
			),
		},
		not_connected: {
			text: <h3>{ __( 'You aren\'t connected to Elementor AI.', 'elementor' ) }</h3>,
			description: __( 'Elementor AI is just a few clicks away. Connect your account to instantly create texts and custom code.', 'elementor' ),
		},
		quota_reached_trail: {
			text: <h3>{ __( 'It\'s time to upgrade.', 'elementor' ) }</h3>,
			description: __( 'Enjoy the free trial? Upgrade now for unlimited access to built-in text and custom code generators.', 'elementor' ),
			buttonText: __( 'Upgrade', 'elementor' ),
			buttonAction: () => window.open( 'https://elementor.com/pro/', '_blank' ),
		},
		quota_reached_subscription: {
			text: <h3>{ __( 'It\'s time to upgrade.', 'elementor' ) }</h3>,
			description: __( 'Love Elementor AI? Upgrade to continue creating with built-in text and custom code generators.', 'elementor' ),
			buttonText: __( 'Upgrade', 'elementor' ),
			buttonAction: () => window.open( 'https://elementor.com/pro/', '_blank' ),
		},
		rate_limit_network: {
			text: <h3>{ __( 'Whoa! Slow down there.', 'elementor' ) }</h3>,
			description: __( 'We can’t process that many requests so fast. Try again in 15 minutes.', 'elementor' ),
		},
	};

	const message = messages[ error ] || messages.default;

	return (
		<Alert
			severity="error"
			action={ message?.buttonText && (
				<Button
					color="inherit"
					size="small"
					onClick={ message.buttonAction }
				>
					{ message.buttonText }
				</Button>
			) }
			{ ...props }
		>
			{ message.text }
			{ message.description && (
				<>
					{ message.description }
				</>
			) }
		</Alert>
	);
};

PromptErrorMessage.propTypes = {
	error: PropTypes.string,
};

export default PromptErrorMessage;
