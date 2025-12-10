import { FlyoutMenuRenderer } from './classes/flyout-menu-renderer';
import { SidebarMenuHandler } from './classes/sidebar-menu-handler';
import { FlyoutInteractionHandler } from './classes/flyout-interaction-handler';

class EditorOneMenu {
	constructor() {
		// eslint-disable-next-line no-undef
		this.config = editorOneMenuConfig || {};
	}

	init() {
		if ( this.isSidebarNavigationActive() ) {
			new SidebarMenuHandler().handle();
			return;
		}

		this.buildFlyoutMenus();
	}

	isSidebarNavigationActive() {
		return document.body.classList.contains( 'e-has-sidebar-navigation' );
	}

	buildFlyoutMenus() {
		const renderer = new FlyoutMenuRenderer( this.config );

		if ( renderer.render() ) {
			new FlyoutInteractionHandler().handle();
		}
	}
}

const initEditorOneMenu = () => {
	const editorOneMenu = new EditorOneMenu();
	editorOneMenu.init();
};

if ( 'loading' === document.readyState ) {
	document.addEventListener( 'DOMContentLoaded', initEditorOneMenu );
} else {
	initEditorOneMenu();
}
