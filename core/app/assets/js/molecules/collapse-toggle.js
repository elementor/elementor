import { useContext } from 'react';
import { arrayToClassName, pxToRem } from 'elementor-app/utils/utils.js';

import { CollapseContext } from './collapse-context';

export default function CollapseToggle( props ) {
	const context = useContext( CollapseContext ),
		style = { '--e-app-collapse-toggle-icon-spacing': pxToRem( props.iconSpacing ) },
		classNameBase = 'e-app-collapse-toggle',
		classes = [ classNameBase, { [ classNameBase + '--active' ]: props.active } ],
		attrs = {
			style,
			className: arrayToClassName( classes ),
		};

	if ( props.active ) {
		attrs.onClick = () => context.toggle();
	}

	return (
		<div { ...attrs }>
			{ props.children }

			{ props.active && props.showIcon && <i className="eicon-caret-down e-app-collapse-toggle__icon" /> }
		</div>
	);
}

CollapseToggle.propTypes = {
	className: PropTypes.string,
	iconSpacing: PropTypes.number,
	showIcon: PropTypes.bool,
	active: PropTypes.bool,
	children: PropTypes.any,
};

CollapseToggle.defaultProps = {
	className: '',
	iconSpacing: 20,
	showIcon: true,
	active: true,
};
