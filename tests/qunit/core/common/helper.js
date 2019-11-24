export default class CommonHelper {
	static runShortcut( args ) {
		jQuery( document ).trigger( jQuery.Event( 'keydown', args ) );
	}
}
