import { Alert, AlertAction } from '@elementor/ui';

const UpgradeBanner = ( { onClose, ...props } ) => {
	return (
		<Alert
			icon={ false }
			action={ (
				<AlertAction
					onClick={ () => window.open( 'https://go.elementor.com/ai-banner-free-upgrade/', '_blank' ) }
				>
					{ __( 'Upgrade', 'elementor' ) }
				</AlertAction>
			) }
			variant="filled"
			color="promotion"
			onClose={ onClose }
			{ ...props }
		>
			{ __( 'You’re using a limited license. Get maximum access to Elementor AI.', 'elementor' ) }
		</Alert>
	);
};

UpgradeBanner.propTypes = {
	onClose: PropTypes.func,
	sx: PropTypes.object,
};

export default UpgradeBanner;
