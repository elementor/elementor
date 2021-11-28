import { arrayToClassName } from 'elementor-app/utils/utils.js';

import './checkbox.scss';

export default function Checkbox( props ) {
	const baseClassName = 'eps-checkbox',
		classes = [ baseClassName, props.className ],
		attrs = { ...props };

	if ( props.rounded ) {
		classes.push( baseClassName + '--rounded' );
	}

	if ( props.indeterminate ) {
		classes.push( baseClassName + '--some-selected' );
	}

	// Removing non-native attributes before passing it to the Checkbox component.
	delete attrs.indeterminate;
	delete attrs.rounded;

	return (
		<input
			{ ...attrs }
			type="checkbox"
			disabled={ props.disabled }
			className={ arrayToClassName( classes ) }
		/>
	);
}

Checkbox.propTypes = {
	className: PropTypes.string,
	disabled: PropTypes.bool,
	indeterminate: PropTypes.bool,
	rounded: PropTypes.bool,
};

Checkbox.defaultProps = {
	className: '',
	disabled: false,
	indeterminate: false,
};
