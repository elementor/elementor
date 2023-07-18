import { Box, Typography, LinearProgress, Stack } from '@elementor/ui';
import { AIIcon } from '@elementor/icons';

const ImageLoader = () => (
	<Stack alignItems="center" justifyContent="center" gap={ 5 } width="100%">
		<AIIcon sx={ { color: 'text.primary', fontSize: '60px', mb: 3 } } />

		<Typography variant="h4" sx={ { color: 'text.primary' } }>{ __( 'Bringing your vision to life...', 'elementor' ) }</Typography>

		<Typography variant="body2">{ __( 'Hold tight, painting dreams might take a moment.', 'elementor' ) }</Typography>

		<Box sx={ { px: 4, py: 6, width: '100%', maxWidth: 600 } }>
			<LinearProgress color="inherit" />
		</Box>
	</Stack>
);

export default ImageLoader;
