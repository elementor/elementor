import { EditorOneEventManager } from 'elementor-editor-utils/editor-one-events';

const SELECTORS = {
	elementorMenuLink: '#toplevel_page_elementor-home > a.menu-top',
	themeBuilderItem: '[data-slug="elementor-theme-builder"] a, .wp-submenu a[href*="page=elementor-theme-builder"]',
};

export class MenuEventsTracker {
	static attach() {
		this.attachElementorMenuClick();
		this.attachThemeBuilderClick();
	}

	static attachElementorMenuClick() {
		const menuLink = document.querySelector( SELECTORS.elementorMenuLink );

		if ( ! menuLink ) {
			return;
		}

		menuLink.addEventListener( 'click', () => {
			EditorOneEventManager.sendWpDashElementorMenuClick();
		} );
	}

	static attachThemeBuilderClick() {
		document.addEventListener( 'click', ( event ) => {
			const link = event.target.closest( SELECTORS.themeBuilderItem );

			if ( link ) {
				EditorOneEventManager.sendWpDashThemeBuilderClick();
			}
		}, true );
	}

	static trackEditorSubMenuOpened() {
		EditorOneEventManager.sendWpDashEditorSubMenuHover();
	}
}
