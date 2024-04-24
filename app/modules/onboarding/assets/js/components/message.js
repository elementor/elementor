export default function Message( { tier } ) {
	const translatedString = __( 'Based on the features you chose, we recommend the %s plan, or higher', 'elementor' );
	const [ firstPart, secondPart ] = translatedString.split( '%s' );

	return (
		<>
			{ firstPart }
			<strong>{ tier }</strong>
			{ secondPart }
		</>
	);
}

Message.propTypes = {
	tier: PropTypes.string.isRequired,
};
