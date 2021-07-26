import After from 'elementor-api/modules/hooks/ui/after';

/**
 * Show the Floating Bar when the element is in edit mode.
 */
export class ShowFloatingBar extends After {
	getCommand() {
		return 'panel/editor/open';
	}

	getId() {
		return 'show-floating-bar--panel/editor/open';
	}

	getConditions( args ) {
		return !! args.view.setFloatingBarVisible;
	}

	apply( args ) {
		args.view.setFloatingBarVisible( true );
	}
}

export default ShowFloatingBar;
