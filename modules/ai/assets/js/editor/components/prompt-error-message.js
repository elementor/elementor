import { Alert } from '@elementor/ui';

const messages = {
	default: __( 'Unknown error. Please try again later.', 'elementor' ),
	service_outage_internal: __( 'Service outage. Please try again later.', 'elementor' ),
	invalid_connect_data: __( 'Invalid connect data.', 'elementor' ),
	not_connected: __( 'Not connected.', 'elementor' ),
	quota_reached_trail: __( 'You have reached your quota. Upgrade to unlock more', 'elementor' ),
	quota_reached_subscription: __( 'You have reached your quota. Upgrade to unlock more', 'elementor' ),
	rate_limit_network: __( 'Rate limit. Please try again later.', 'elementor' ),
};

const PromptErrorMessage = ( { error, onClose, ...props } ) => {
	return (
		<Alert severity="error" onClose={ onClose } { ...props }>
			{ messages[ error ] || messages.default }
		</Alert>
	);
};

PromptErrorMessage.propTypes = {
	error: PropTypes.string,
	onClose: PropTypes.func.isRequired,
};

export default PromptErrorMessage;
