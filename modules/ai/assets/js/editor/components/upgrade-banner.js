import { Alert, Button, IconButton, Stack } from '@elementor/ui';
import { XIcon } from '@elementor/icons';

const BannerActions = ( { onClose } ) => (
	<Stack direction="row" alignItems="center" gap={ 1 }>
		<Button
			size="small"
			color="inherit"
			variant="outlined"
			onClick={ () => window.open( 'https://go.elementor.com/ai-banner-free-upgrade/', '_blank' ) }
		>
			{ __( 'Upgrade', 'elementor' ) }
		</Button>

		<IconButton color="inherit" size="small" onClick={ onClose }>
			<XIcon />
		</IconButton>
	</Stack>
);

BannerActions.propTypes = {
	onClose: PropTypes.func,
};

const UpgradeBanner = ( { onClose, sx = {}, ...props } ) => {
	return (
		<Alert
			icon={ false }
			action={ <BannerActions onClose={ onClose } /> }
			{ ...props }
			sx={ {
				backgroundColor: 'accent.main',
				color: 'accent.contrastText',
				...sx,
			} }
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
