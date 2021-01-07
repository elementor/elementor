import Utils from 'elementor-app/utils/utils.js';

import './checkbox.scss';

export default function Checkbox( props ) {
	const baseClassName = 'eps-checkbox',
		classes = [ baseClassName, props.className ];

	if ( props.rounded ) {
		classes.push( baseClassName + '--rounded' );
	}

	return (
		<input
			type="checkbox"
			disabled={ props.disabled }
			className={ Utils.arrayToClassName( classes ) }
		/>
	);
}

Checkbox.propTypes = {
	className: PropTypes.string,
	disabled: PropTypes.bool,
	rounded: PropTypes.bool,
};

Checkbox.defaultProps = {
	className: '',
	disabled: false,
};
