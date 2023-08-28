import { Button, Stack, Typography } from '@elementor/ui';
import { UpgradeIcon } from '@elementor/icons';

const VARIANT_FULL = 'full';
const VARIANT_SMALL = 'small';

const PromptHistoryUpgrade = ( { variant } ) => {
	const messages = {
		[ VARIANT_FULL ]: __( 'Want to see your image generation history for as far as the past 90 days?', 'elementor' ),
		[ VARIANT_SMALL ]: __( 'Want to see your image generation history for the past 90 days?', 'elementor' ),
	};

	const actionUrl = 'https://go.elementor.com/ai-popup-purchase-dropdown/';

	return (
		<Stack justifyContent="center"
			sx={ { height: VARIANT_SMALL === variant ? 'auto' : '100%', textAlign: 'center', p: 5 } }>
			<Typography variant="body1" sx={ { marginBottom: 5 } }>
				{ messages[ variant ] || messages[ VARIANT_FULL ] }
			</Typography>

			<Button
				variant="contained"
				color="accent"
				size="small"
				href={ actionUrl }
				target="_blank"
				rel="noopener noreferrer"
				startIcon={ <UpgradeIcon /> }
				sx={ {
					borderRadius: '4px',
					width: '50%',
					alignSelf: 'center',

					'&:hover': {
						color: 'accent.contrastText',
					},
				} }
			>
				{ __( 'Upgrade now', 'elementor' ) }
			</Button>
		</Stack>
	);
};

PromptHistoryUpgrade.propTypes = {
	variant: PropTypes.oneOf( [ VARIANT_FULL, VARIANT_SMALL ] ).isRequired,
};

export default PromptHistoryUpgrade;
