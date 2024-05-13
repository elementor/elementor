import { Typography } from '@elementor/ui';
import PropTypes from 'prop-types';

const OverlayBarText = ( { children, ...props } ) => (
	<Typography variant="caption" color="common.white" { ...props }>
		{ children }
	</Typography>
);

OverlayBarText.propTypes = {
	children: PropTypes.node,
};

export default OverlayBarText;
