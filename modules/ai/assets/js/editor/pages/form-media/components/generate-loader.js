import { Box, Typography, LinearProgress, Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import { AIIcon } from '@elementor/icons';

const GenerateLoader = () => (
	<Stack alignItems="center" justifyContent="center" gap={ 2 } width="100%">
		<AIIcon sx={ { color: 'text.primary', fontSize: '60px', mb: 1 } } />

		<Typography variant="h5" sx={ { color: 'text.primary' } }>{ __( 'Bringing your vision to life...', 'elementor' ) }</Typography>

		<Typography variant="body1">{ __( 'Hold tight, painting dreams might take a moment.', 'elementor' ) }</Typography>

		<Box sx={ { px: 1.5, py: 2.5, width: '100%', maxWidth: 600 } }>
			<LinearProgress color="inherit" />
		</Box>
	</Stack>
);

export default GenerateLoader;
