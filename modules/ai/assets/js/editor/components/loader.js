import { Box, LinearProgress } from '@elementor/ui';

const Loader = ( { sx = {}, ...props } ) => (
	<Box
		width="100%"
		display="flex"
		alignItems="center"
		sx={ { px: 1.5, minHeight: ( theme ) => theme.sizing[ 500 ] } }
	>
		<LinearProgress color="secondary" { ...props } sx={ { width: '100%', ...sx } } />
	</Box>
);

Loader.propTypes = {
	sx: PropTypes.object,
};

export default Loader;
