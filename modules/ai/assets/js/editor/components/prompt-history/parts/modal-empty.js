import { Stack, Typography } from '@elementor/ui';
import { HISTORY_TYPES, TRANSLATED_HISTORY_TYPES, TRANSLATED_HISTORY_TYPES_FALLBACK } from '../history-types';

const getTranslatedPromptType = ( promptType ) => {
	if ( TRANSLATED_HISTORY_TYPES[ promptType ] ) {
		return TRANSLATED_HISTORY_TYPES[ promptType ];
	}

	return TRANSLATED_HISTORY_TYPES_FALLBACK;
};

const PromptHistoryEmpty = ( { promptType } ) => {
	return (
		<Stack justifyContent="center" sx={ { height: '100%', textAlign: 'center' } } data-testid="e-ph-empty">
			<Typography variant="h6">{ __( 'Prepare to be amazed', 'elementor' ) }</Typography>
			<Typography variant="body1">
				{ sprintf(
					// Translators: %s: History type.
					__( 'This is where you\'ll find all the %s you\'ve generated using Elementor AI.', 'elementor' ),
					getTranslatedPromptType( promptType ) )
				}
			</Typography>
		</Stack>
	);
};

PromptHistoryEmpty.propTypes = {
	promptType: PropTypes.oneOf( Object.values( HISTORY_TYPES ) ).isRequired,
};

export default PromptHistoryEmpty;
