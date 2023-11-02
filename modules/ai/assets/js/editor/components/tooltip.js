import { Tooltip as UITooltip } from '@elementor/ui';
import PropTypes from 'prop-types';

const Tooltip = ( { children, ...props } ) => {
	return (
		<UITooltip
			componentsProps={ {
				tooltip: {
					sx: {
						'&.MuiTooltip-tooltip[class*="MuiTooltip-tooltipPlacement"]': {
							m: 0,
							fontSize: '10px',
							fontWeight: 500,
							lineHeight: '1.4em',
						},
						py: 0.5,
						px: 1,
					},
				},
			} } { ...props }>
			{ children }
		</UITooltip>
	);
};

Tooltip.propTypes = {
	children: PropTypes.oneOfType( [
		PropTypes.arrayOf( PropTypes.node ),
		PropTypes.node,
	] ),
};

export default Tooltip;
