export default class AdminMenuHandler extends elementorModules.ViewModule {
	getDefaultElements() {
		const settings = this.getSettings(),
			elements = {
				$adminPageMenuLink: jQuery( `a[href="${ settings.slug }"]` ),
			};

		return elements;
	}

	// This method highlights the currently visited submenu item for the slug provided as an argument to this handler.
	// This method accepts a jQuery instance of a custom submenu item to highlight. If provided, this method will
	// highlight the provided item.
	highlightSubMenuItem( $element = null ) {
		const $submenuItem = $element ? $element : this.elements.$adminPageMenuLink;

		$submenuItem.addClass( 'current' );

		// Need to add the 'current' class to the link element's parent `<li>` element as well.
		$submenuItem.parent().addClass( 'current' );
	}

	onInit() {
		const settings = this.getSettings();

		super.onInit();

		if ( window.location.href.includes( settings.slug ) ) {
			this.highlightSubMenuItem();
		}
	}
}
