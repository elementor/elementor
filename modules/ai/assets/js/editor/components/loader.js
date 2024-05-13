import { Box, LinearProgress } from '@elementor/ui';
import PropTypes from 'prop-types';

const Loader = ( { sx = {}, BoxProps = {}, ...props } ) => (
	<Box
		width="100%"
		display="flex"
		alignItems="center"
		{ ...BoxProps }
		sx={ {
			px: 1.5,
			minHeight: ( theme ) => theme.spacing( 5 ),
			...( BoxProps.sx || {} ),
		} }
	>
		<LinearProgress color="secondary" { ...props } sx={ { width: '100%', ...sx } } />
	</Box>
);

Loader.propTypes = {
	sx: PropTypes.object,
	BoxProps: PropTypes.object,
};

export default Loader;
