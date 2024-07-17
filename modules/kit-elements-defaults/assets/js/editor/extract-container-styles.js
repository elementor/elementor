export default function extractContainerStyles( container ) {
	const { model } = container,
		styles = model.get( 'styles' );

	return {
		...styles,
	};
}
