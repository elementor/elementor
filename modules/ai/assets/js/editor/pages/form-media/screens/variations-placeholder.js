import { Box, Grid, Stack, Typography } from '@elementor/ui';
import { AIIcon } from '@elementor/icons';

const VariationsPlaceholder = () => {
	return (
		<Box sx={ { overflowY: 'scroll', p: 10 } } flexGrow={ 1 }>
			<Stack gap={ 4 } sx={ { mb: 7 } }>
				<Typography variant="h6">{ __( 'Generated Images will appear here', 'elementor' ) }</Typography>
				<Typography variant="body1">{ __( 'Place an image in your website or use it as a reference to generate similar images..', 'elementor' ) }</Typography>
			</Stack>

			<Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={ 7 }>
				{
					Array( 4 ).fill( true ).map( ( _, index ) => (
						<Box
							key={ `placeholder-${ index }` }
							display="flex"
							justifyContent="center"
							alignItems="center"
							sx={ { bgcolor: 'secondary.background', height: 336 } }
						>
							<AIIcon color="secondary" sx={ { fontSize: 36 } } />
						</Box>
					) )
				}
			</Box>
		</Box>
	);
};

VariationsPlaceholder.propTypes = {};

export default VariationsPlaceholder;
