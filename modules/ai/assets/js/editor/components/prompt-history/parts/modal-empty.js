import { Stack, Typography } from '@elementor/ui';
import { HISTORY_TYPES, TRANSLATED_HISTORY_TYPES, TRANSLATED_HISTORY_TYPES_FALLBACK } from '../history-types';

const PromptHistoryEmpty = ( { promptType } ) => {
	const getTranslatedPromptType = () => {
		if ( TRANSLATED_HISTORY_TYPES[ promptType ] ) {
			return TRANSLATED_HISTORY_TYPES[ promptType ];
		}

		return TRANSLATED_HISTORY_TYPES_FALLBACK;
	};

	return (
		<Stack justifyContent="center" sx={ { height: '100%', textAlign: 'center' } }>
			<Typography variant="h6">{ __( 'Prepare to be amazed', 'elementor' ) }</Typography>
			<Typography variant="body1">
				{ sprintf(
					// Translators: %s: History type.
					__( 'This is where you\'ll find all the %s you\'ve generated using Elementor AI.', 'elementor' ),
					getTranslatedPromptType() )
				}
			</Typography>
		</Stack>
	);
};

PromptHistoryEmpty.propTypes = {
	promptType: PropTypes.oneOf( Object.values( HISTORY_TYPES ) ).isRequired,
};

export default PromptHistoryEmpty;
