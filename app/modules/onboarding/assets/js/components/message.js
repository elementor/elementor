export default function Message( { tier } ) {
	/* Translators: %s: Plan name */
	const translatedString = __( 'Based on the features you chose, we recommend the %s plan, or higher', 'elementor' );
	const [ messageFirstPart, messageSecondPart ] = translatedString.split( '%s' );

	return (
		<>
			{ messageFirstPart }
			<strong>{ tier }</strong>
			{ messageSecondPart }
		</>
	);
}

Message.propTypes = {
	tier: PropTypes.string.isRequired,
};
