import { Stack, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';
import { HISTORY_TYPES, getTranslatedPromptHistoryType } from '../history-types';

const PromptHistoryEmpty = ( { historyType } ) => {
	return (
		<Stack justifyContent="center" sx={ { height: '100%', textAlign: 'center' } } data-testid="e-ph-empty">
			<Typography variant="h6">{ __( 'Prepare to be amazed', 'elementor' ) }</Typography>
			<Typography variant="body1">
				{
					sprintf(
						// Translators: %s: History type.
						__( 'This is where you\'ll find all the %s you\'ve generated using Elementor AI.', 'elementor' ),
						getTranslatedPromptHistoryType( historyType ),
					)
				}
			</Typography>
		</Stack>
	);
};

PromptHistoryEmpty.propTypes = {
	historyType: PropTypes.oneOf( Object.values( HISTORY_TYPES ) ).isRequired,
};

export default PromptHistoryEmpty;
