import react from 'React'

function Message( { tier } ) {
	const translatedString1 = __('Based on the features you chose, we recommend the ', 'elementor'),
		translatedString2 = __('plan, or higher', 'elementor');

	return (
		<>
			{ `${ translatedString1 }<strong>${ tier }</strong> ${ translatedString2 }` }
		</>
	)
}

export default Message;
