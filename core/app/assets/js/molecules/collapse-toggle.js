import { useContext } from 'react';
import { pxToRem } from 'elementor-app/utils/utils.js';

import { CollapseContext } from './collapse-context';

export default function CollapseToggle( props ) {
	const context = useContext( CollapseContext ),
		style = { '--e-app-collapse-toggle-icon-spacing': pxToRem( props.iconSpacing ) };

	return (
		<div style={ style } className="e-app-collapse-toggle" onClick={ context.toggle }>
			{ props.children }

			{ props.showIcon && <i className="eicon-caret-down e-app-collapse-toggle__icon" /> }
		</div>
	);
}

CollapseToggle.propTypes = {
	className: PropTypes.string,
	iconSpacing: PropTypes.number,
	showIcon: PropTypes.bool,
	children: PropTypes.any,
};

CollapseToggle.defaultProps = {
	className: '',
	iconSpacing: 20,
	showIcon: true,
};
