import WpDashboardTracking, { NAV_AREAS } from '../wp-dashboard-tracking';
import BaseTracking from './base-tracking';

const ELEMENTOR_MENU_SELECTORS = {
	ELEMENTOR_TOP_LEVEL: 'li#toplevel_page_elementor-home',
	ADMIN_MENU: '#adminmenu',
	TOP_LEVEL_LINK: '.wp-menu-name',
	SUBMENU_CONTAINER: '.wp-submenu',
	SUBMENU_ITEM: '.wp-submenu li a',
	SUBMENU_ITEM_TOP_LEVEL: '.wp-has-submenu',
	SIDEBAR_NAVIGATION: '#editor-one-sidebar-navigation',
	FLYOUT_MENU: '.elementor-submenu-flyout',
	FLYOUT_PARENT: '.elementor-has-flyout',
};

class NavigationTracking extends BaseTracking {
	static init() {
		this.attachElementorMenuTracking();
		this.attachSidebarNavigationTracking();
	}

	static attachElementorMenuTracking() {
		const elementorMenu = document.querySelector( ELEMENTOR_MENU_SELECTORS.ELEMENTOR_TOP_LEVEL );

		if ( ! elementorMenu ) {
			return;
		}

		this.attachMenuTracking( elementorMenu, 'Elementor' );
	}

	static attachSidebarNavigationTracking() {
		const sidebar = document.querySelector( ELEMENTOR_MENU_SELECTORS.SIDEBAR_NAVIGATION );

		if ( sidebar ) {
			this.attachSidebarClickListener( sidebar );
			return;
		}

		this.waitForSidebar();
	}

	static waitForSidebar() {
		this.addObserver(
			document.body,
			{ childList: true, subtree: true },
			( mutations, observer ) => {
				const sidebar = document.querySelector( ELEMENTOR_MENU_SELECTORS.SIDEBAR_NAVIGATION );
				if ( sidebar ) {
					observer.disconnect();
					this.attachSidebarClickListener( sidebar );
				}
			},
		);
	}

	static attachSidebarClickListener( sidebar ) {
		this.addEventListenerTracked(
			sidebar,
			'click',
			( event ) => {
				this.handleSidebarClick( event );
			},
			{ capture: true },
		);
	}

	static attachMenuTracking( menuElement, menuName ) {
		this.addEventListenerTracked(
			menuElement,
			'click',
			( event ) => {
				this.handleMenuClick( event, menuName );
			},
		);
	}

	static handleMenuClick( event, menuName ) {
		const link = event.target.closest( 'a' );

		if ( ! link ) {
			return;
		}

		const isTopLevel = link.classList.contains( 'menu-top' );
		const itemId = this.extractItemId( link );
		const area = this.determineNavArea( link );

		WpDashboardTracking.trackNavClicked( itemId, isTopLevel ? null : menuName, area );
	}

	static handleSidebarClick( event ) {
		const clickedElement = event.target.closest( 'a, button, [role="button"]' );

		if ( ! clickedElement ) {
			return;
		}

		const itemId = this.extractSidebarItemId( clickedElement );

		WpDashboardTracking.trackNavClicked( itemId, null, NAV_AREAS.SIDEBAR_MENU );
	}

	static extractSidebarItemId( element ) {
		const paragraph = element.querySelector( 'p' );
		if ( paragraph ) {
			return paragraph.textContent.trim();
		}

		const textContent = element.textContent.trim();
		if ( textContent ) {
			return textContent;
		}

		return 'unknown';
	}

	static extractPageFromUrl( href ) {
		const urlParams = new URLSearchParams( href.split( '?' )[ 1 ] || '' );
		const page = urlParams.get( 'page' );

		if ( page ) {
			return page;
		}

		const postType = urlParams.get( 'post_type' );

		if ( postType ) {
			return postType;
		}

		return 'unknown';
	}

	static extractItemId( link ) {
		const textContent = link.textContent.trim();

		if ( textContent ) {
			return textContent;
		}

		const href = link.getAttribute( 'href' );
		if ( href ) {
			return this.extractPageFromUrl( href );
		}

		const linkId = link.getAttribute( 'id' );
		if ( linkId ) {
			return linkId;
		}

		return 'unknown';
	}

	static determineNavArea( link ) {
		const parentMenu = link.closest( 'li.menu-top' );

		if ( parentMenu ) {
			const isSubmenuItem = link.closest( ELEMENTOR_MENU_SELECTORS.SUBMENU_CONTAINER );

			if ( isSubmenuItem ) {
				const submenuElement = link.closest( ELEMENTOR_MENU_SELECTORS.SUBMENU_ITEM_TOP_LEVEL );

				if ( submenuElement.classList.contains( 'wp-not-current-submenu' ) ) {
					return NAV_AREAS.HOVER_MENU;
				}

				return NAV_AREAS.SUBMENU;
			}

			return NAV_AREAS.LEFT_MENU;
		}

		return NAV_AREAS.LEFT_MENU;
	}
}

export default NavigationTracking;
