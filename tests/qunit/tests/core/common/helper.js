/* global jQuery */

export default class CommonHelper {
	static runShortcut( which, isCtrl = false, isShift = false ) {
		const args = { which };

		if ( isCtrl ) {
			args.ctrlKey = true;
			args.metaKey = true;
		}

		if ( isShift ) {
			args.shiftKey = true;
		}

		jQuery( document ).trigger( jQuery.Event( 'keydown', args ) );
	}
}
