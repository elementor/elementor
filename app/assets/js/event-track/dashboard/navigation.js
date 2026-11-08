import WpDashboardTracking, { NAV_AREAS } from '../wp-dashboard-tracking';
import BaseTracking from './base-tracking';

const ELEMENTOR_MENU_SELECTORS = {
	ELEMENTOR_TOP_LEVEL: 'li#toplevel_page_elementor',
	TEMPLATES_TOP_LEVEL: 'li#menu-posts-elementor_library',
	ELEMENTOR_HOME_TOP_LEVEL: 'li#toplevel_page_elementor-home',
	ADMIN_MENU: '#adminmenu',
	TOP_LEVEL_LINK: '.wp-menu-name',
	TOP_LEVEL_ANCHOR: 'a.menu-top',
	SUBMENU_CONTAINER: '.wp-submenu',
	SUBMENU_ITEM: '.wp-submenu li a',
	SUBMENU_ITEM_TOP_LEVEL: '.wp-has-submenu',
};

const ADMIN_NAV_CLICK_EVENT = 'elementor/admin/nav-click';

class NavigationTracking extends BaseTracking {
	static init() {
		this.attachSidebarNavigationTracking();
		this.attachElementorMenuTracking();
		this.attachElementorHomeMenuTracking();
		this.attachTemplatesMenuTracking();
	}

	static attachTemplatesMenuTracking() {
		const templatesMenu = document.querySelector( ELEMENTOR_MENU_SELECTORS.TEMPLATES_TOP_LEVEL );

		if ( ! templatesMenu ) {
			return;
		}

		this.attachMenuTracking( templatesMenu );
	}

	static attachElementorHomeMenuTracking() {
		const elementorHomeMenu = document.querySelector( ELEMENTOR_MENU_SELECTORS.ELEMENTOR_HOME_TOP_LEVEL );

		if ( ! elementorHomeMenu ) {
			return;
		}

		this.attachMenuTracking( elementorHomeMenu );
	}

	static attachElementorMenuTracking() {
		const elementorMenu = document.querySelector( ELEMENTOR_MENU_SELECTORS.ELEMENTOR_TOP_LEVEL );

		if ( ! elementorMenu ) {
			return;
		}

		this.attachMenuTracking( elementorMenu );
	}

	static attachSidebarNavigationTracking() {
		this.addEventListenerTracked(
			window,
			ADMIN_NAV_CLICK_EVENT,
			( event ) => {
				const { itemId, rootItem, navClickId } = event.detail;

				WpDashboardTracking.trackNavClicked( itemId, rootItem || null, NAV_AREAS.SIDEBAR_MENU, navClickId );
			},
		);
	}

	static attachMenuTracking( menuElement ) {
		this.addEventListenerTracked(
			menuElement,
			'click',
			( event ) => {
				this.handleMenuClick( event, menuElement );
			},
		);
	}

	static handleMenuClick( event, menuElement ) {
		const link = event.target.closest( 'a' );

		if ( ! link ) {
			return;
		}

		const isTopLevel = link.classList.contains( 'menu-top' );
		const itemId = this.extractItemId( link );
		const area = this.determineNavArea( link );

		WpDashboardTracking.trackNavClicked( itemId, isTopLevel ? null : this.extractRootItemId( menuElement ), area );
	}

	static extractRootItemId( menuElement ) {
		const rootLink = menuElement.querySelector( ELEMENTOR_MENU_SELECTORS.TOP_LEVEL_ANCHOR );

		return rootLink ? this.extractItemId( rootLink ) : null;
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
		const href = link.getAttribute( 'href' );
		const eventId = href ? WpDashboardTracking.getMenuEventId( this.toMenuHrefKey( href ) ) : null;

		if ( eventId ) {
			return eventId;
		}

		const textContent = link.textContent.trim();

		if ( textContent ) {
			return textContent;
		}

		if ( href ) {
			return this.extractPageFromUrl( href );
		}

		const linkId = link.getAttribute( 'id' );
		if ( linkId ) {
			return linkId;
		}

		return 'unknown';
	}

	static toMenuHrefKey( href ) {
		const url = new URL( href, window.location.href );

		return `${ url.pathname.split( '/' ).pop() }${ url.search }${ url.hash }`;
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
