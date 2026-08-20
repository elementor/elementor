import { FlyoutMenuRenderer } from './classes/flyout-menu-renderer';
import { SidebarMenuHandler } from './classes/sidebar-menu-handler';
import { FlyoutInteractionHandler } from './classes/flyout-interaction-handler';
import { MenuEventsTracker } from './classes/menu-events-tracker';

class EditorOneMenu {
	constructor() {
		this.config = window?.editorOneMenuConfig || {};
	}

	init() {
		MenuEventsTracker.attach();

		if ( this.isSidebarNavigationActive() ) {
			new SidebarMenuHandler();
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
