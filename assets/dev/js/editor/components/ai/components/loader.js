import { Box, LinearProgress } from '@elementor/ui';

const Loader = () => (
	<Box sx={ { px: 4, py: 6 } }>
		<LinearProgress color="secondary" />
	</Box>
);

export default Loader;
