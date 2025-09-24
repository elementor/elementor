export default function Button( props ) {
	const { buttonSettings, type } = props;
	const { elRef, ...otherSettings } = buttonSettings;

	let buttonClasses = 'e-onboarding__button';

	if ( type ) {
		buttonClasses += ` e-onboarding__button-${ type }`;
	}

	if ( otherSettings.className ) {
		otherSettings.className += ' ' + buttonClasses;
	} else {
		otherSettings.className = buttonClasses;
	}

	if ( otherSettings.href ) {
		return <a ref={ elRef } { ...otherSettings }>{ otherSettings.text }</a>;
	}

	return <div ref={ elRef } { ...otherSettings }>{ otherSettings.text }</div>;
}

Button.propTypes = {
	buttonSettings: PropTypes.object.isRequired,
	type: PropTypes.string,
};
