export default function Button( props ) {
	const { buttonSettings, type } = props;

	let buttonClasses = 'e-onboarding__button';

	if ( type ) {
		buttonClasses += ` e-onboarding__button-${ type }`;
	}

	if ( buttonSettings.className ) {
		buttonSettings.className += ' ' + buttonClasses;
	} else {
		buttonSettings.className = buttonClasses;
	}

	const { elRef, ...buttonProps } = buttonSettings;

	if ( buttonSettings.href ) {
		return <a ref={ elRef } { ...buttonProps }>{ buttonSettings.text }</a>;
	}

	return <div ref={ elRef } { ...buttonProps }>{ buttonSettings.text }</div>;
}

Button.propTypes = {
	buttonSettings: PropTypes.object.isRequired,
	type: PropTypes.string,
};
