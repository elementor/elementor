import { Typography } from '@elementor/ui';

const OverlayBarText = ( { children, ...props } ) => (
	<Typography variant="caption" color="common.white" { ...props }>
		{ children }
	</Typography>
);

OverlayBarText.propTypes = {
	children: PropTypes.node,
};

export default OverlayBarText;
