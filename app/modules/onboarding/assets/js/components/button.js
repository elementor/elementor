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

	const { elRef, href, connectUrl, ...buttonProps } = buttonSettings;

	if ( connectUrl ) {
		return <button ref={ elRef } data-connect-url={ connectUrl } { ...buttonProps }>{ buttonSettings.text }</button>;
	}

	if ( href ) {
		return <a ref={ elRef } { ...buttonProps }>{ buttonSettings.text }</a>;
	}

	return <div ref={ elRef } { ...buttonProps }>{ buttonSettings.text }</div>;
}

Button.propTypes = {
	buttonSettings: PropTypes.object.isRequired,
	type: PropTypes.string,
};
