export default class MenuHandler extends elementorModules.ViewModule {
	getDefaultSettings() {
		return {
			selectors: {
				currentSubmenuItems: '#adminmenu .current',
			},
		};
	}

	getDefaultElements() {
		const settings = this.getSettings();

		return {
			$currentSubmenuItems: jQuery( settings.selectors.currentSubmenuItems ),
			$adminPageMenuLink: jQuery( `a[href="${ settings.path }"]` ),
		};
	}

	// This method highlights the currently visited submenu item for the slug provided as an argument to this handler.
	// This method also accepts a jQuery instance of a custom submenu item to highlight. If provided, the provided
	// item will be the one highlighted.
	highlightSubMenuItem( $element = null ) {
		const $submenuItem = $element || this.elements.$adminPageMenuLink;

		if ( this.elements.$currentSubmenuItems.length ) {
			this.elements.$currentSubmenuItems.removeClass( 'current' );
		}

		$submenuItem.addClass( 'current' );

		// Need to add the 'current' class to the link element's parent `<li>` element as well.
		$submenuItem.parent().addClass( 'current' );
	}

	highlightTopLevelMenuItem( $elementToHighlight, $elementToRemove = null ) {
		const activeClasses = 'wp-has-current-submenu wp-menu-open current';

		$elementToHighlight
			.parent()
			.addClass( activeClasses )
			.removeClass( 'wp-not-current-submenu' );

		if ( $elementToRemove ) {
			$elementToRemove.removeClass( activeClasses );
		}
	}

	onInit() {
		super.onInit();

		const settings = this.getSettings();

		if ( window.location.href.includes( settings.path ) ) {
			this.highlightSubMenuItem();
		}
	}
}
