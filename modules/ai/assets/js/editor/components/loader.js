import { Box, LinearProgress } from '@elementor/ui';

const Loader = ( props ) => (
	<Box sx={ { px: 4, py: 6 } } width="100%">
		<LinearProgress color="secondary" { ...props } />
	</Box>
);

export default Loader;
