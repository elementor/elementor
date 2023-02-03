import { arrayToClassName } from 'elementor-app/utils/utils.js';

import './checkbox.scss';

export default function Checkbox( { className, checked, rounded, indeterminate, error, disabled, onChange } ) {
	const baseClassName = 'eps-checkbox',
		classes = [ baseClassName, className ];

	if ( rounded ) {
		classes.push( baseClassName + '--rounded' );
	}

	if ( indeterminate ) {
		classes.push( baseClassName + '--indeterminate' );
	}

	if ( error ) {
		classes.push( baseClassName + '--error' );
	}

	return (
		<input
			className={ arrayToClassName( classes ) }
			type="checkbox"
			checked={ checked }
			disabled={ disabled }
			onChange={ onChange }
		/>
	);
}

Checkbox.propTypes = {
	className: PropTypes.string,
	checked: PropTypes.bool,
	disabled: PropTypes.bool,
	indeterminate: PropTypes.bool,
	rounded: PropTypes.bool,
	error: PropTypes.bool,
	onChange: PropTypes.func,
};

Checkbox.defaultProps = {
	className: '',
	checked: null,
	disabled: false,
	indeterminate: false,
	error: false,
	onChange: () => {},
};
