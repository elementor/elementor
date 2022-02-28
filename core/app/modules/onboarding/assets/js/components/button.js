export default function Button( props ) {
	const { button, type } = props;

	let buttonClasses = 'e-onboarding__button';

	if ( type ) {
		buttonClasses += ` e-onboarding__button-${ type }`;
	}

	if ( button.className ) {
		button.className += ' ' + buttonClasses;
	} else {
		button.className = buttonClasses;
	}

	if ( button.href ) {
		return <a href={ button.href } target={ button.target } ref={ button.ref } { ...button }>{ button.text }</a>;
	}

	return <div { ...button }>{ button.text }</div>;
}

Button.propTypes = {
	button: PropTypes.object.isRequired,
	type: PropTypes.string,
};
