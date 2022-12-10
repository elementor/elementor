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

	if ( buttonSettings.href ) {
		return <a { ...buttonSettings }>{ buttonSettings.text }</a>;
	}

	return <div { ...buttonSettings }>{ buttonSettings.text }</div>;
}

Button.propTypes = {
	buttonSettings: PropTypes.object.isRequired,
	type: PropTypes.string,
};
