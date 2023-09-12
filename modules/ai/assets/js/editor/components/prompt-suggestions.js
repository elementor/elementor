import { Box, Typography, Stack, Chip } from '@elementor/ui';

const PromptSuggestions = ( props ) => {
	return (
		<Box>
			<Typography variant="subtitle1" color="text.secondary">
				{ __( 'Suggested prompts', 'elementor' ) + ':' }
			</Typography>

			<Stack direction="column" alignItems="flex-start" gap={ 1 } sx={ { my: 1 } }>
				{ props.suggestions?.map( ( option, index ) => (
					<Chip
						key={ index }
						variant="outlined"
						size="large"
						color="secondary"
						label={ props.suggestionFilter?.( option ) || option }
						onClick={ () => props.onSelect( option ) }
					/>
				) ) }
			</Stack>
		</Box>
	);
};

PromptSuggestions.propTypes = {
	suggestions: PropTypes.arrayOf( PropTypes.string ),
	onSelect: PropTypes.func.isRequired,
	suggestionFilter: PropTypes.func,
};

export default PromptSuggestions;
