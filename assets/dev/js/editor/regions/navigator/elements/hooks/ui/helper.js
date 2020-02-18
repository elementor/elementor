export default class Helper {
	static toggleVisibilityClass( elementId ) {
		const view = $e.components.get( 'document' ).utils.findViewById( elementId );

		if ( view ) {
			view.toggleVisibilityClass();
		}
	}
}
