import { FlyoutMenuRenderer } from './classes/flyout-menu-renderer';
import { SidebarMenuHandler } from './classes/sidebar-menu-handler';
import { FlyoutInteractionHandler } from './classes/flyout-interaction-handler';

class AdminMenu {
	constructor() {
		this.config = elementorAdminMenuConfig || {};
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
		console.log( 'Editor One: Building flyout menus', this.config );
		const renderer = new FlyoutMenuRenderer( this.config );

		if ( renderer.render() ) {
			new FlyoutInteractionHandler().handle();
		} else {
			console.warn( 'Editor One: No flyout menus to render' );
		}
	}
}

const initAdminMenu = () => {
	const adminMenu = new AdminMenu();
	adminMenu.init();
};

if ( 'loading' === document.readyState ) {
	document.addEventListener( 'DOMContentLoaded', initAdminMenu );
} else {
	initAdminMenu();
}

