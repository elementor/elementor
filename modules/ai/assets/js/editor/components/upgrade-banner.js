
import { Alert, Button, IconButton, Stack } from '@elementor/ui';
import { XIcon } from '@elementor/icons';

const CloseButton = ( props ) => <IconButton color="inherit" size="small" { ...props }><XIcon /></IconButton>;

const UpgradeCTA = ( props ) => (
	<Button
		variant="outlined"
		color="inherit"
		size="small"
		{ ...props }
	>
		{ __( 'Upgrade', 'elementor' ) }
	</Button>
);

const UpgradeBanner = ( { onClose, hasSubscription, usagePercentage, ...props } ) => {
	let url = 'https://go.elementor.com/ai-popup-purchase-dropdown/';

	if ( hasSubscription ) {
		url = usagePercentage < 100 ? 'https://go.elementor.com/ai-popup-upgrade-limit-reached-80-percent/' : 'https://go.elementor.com/ai-popup-upgrade-limit-reached/';
	}

	return (
		<Alert
			icon={ false }
			action={
				<Stack direction="row" alignItems="center" gap={ 1 }>
					<UpgradeCTA onClick={ () => window.open( url, '_blank' ) } />
					<CloseButton onClick={ onClose } />
				</Stack>
			}
			{ ...props }
			sx={ {
				backgroundColor: 'accent.main',
				color: 'accent.contrastText',
				...props.sx,
			} }
		>
			{ __( 'You’re using a limited license. Get maximum access to Elementor AI.', 'elementor' ) }
		</Alert>
	);
};

UpgradeBanner.propTypes = {
	onClose: PropTypes.func,
	hasSubscription: PropTypes.bool,
	usagePercentage: PropTypes.number,
	sx: PropTypes.object,
};

export default UpgradeBanner;
