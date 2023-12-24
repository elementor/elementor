import { Button, Stack, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';
import { UpgradeIcon } from '@elementor/icons';
import { getTranslatedPromptHistoryType, HISTORY_TYPES } from '../history-types';

const VARIANT_FULL = 'full';
const VARIANT_SMALL = 'small';

const messages = {
	// Translators: %s: History type.
	[ VARIANT_FULL ]: __( 'Want to see your %s generation history for as far as the past 90 days?', 'elementor' ),
	// Translators: %s: History type.
	[ VARIANT_SMALL ]: __( 'Want to see your %s generation history for the past 90 days?', 'elementor' ),
};

const actionUrl = 'https://go.elementor.com/ai-popup-purchase-dropdown/';

const getMessage = ( variant, historyType ) => {
	const placeholder = messages[ variant ] || messages[ VARIANT_FULL ];
	const translatedHistoryType = getTranslatedPromptHistoryType( historyType );

	return sprintf( placeholder, translatedHistoryType );
};

const PromptHistoryUpgrade = ( { variant, historyType } ) => {
	return (
		<Stack
			justifyContent="center"
			sx={ { height: VARIANT_SMALL === variant ? 'auto' : '100%', textAlign: 'center', p: 2 } }
			data-testid={ `e-ph-upgrade-${ variant }` }>
			<Typography variant="body1" sx={ { marginBottom: 2 } }>
				{ getMessage( variant, historyType ) }
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
	historyType: PropTypes.oneOf( Object.values( HISTORY_TYPES ) ).isRequired,
};

export default PromptHistoryUpgrade;
