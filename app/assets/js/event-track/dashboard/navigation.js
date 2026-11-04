import WpDashboardTracking, { NAV_AREAS } from '../wp-dashboard-tracking';
import BaseTracking from './base-tracking';

const ELEMENTOR_MENU_SELECTORS = {
	ELEMENTOR_TOP_LEVEL: 'li#toplevel_page_elementor',
	TEMPLATES_TOP_LEVEL: 'li#menu-posts-elementor_library',
	ELEMENTOR_HOME_TOP_LEVEL: 'li#toplevel_page_elementor-home',
	ADMIN_MENU: '#adminmenu',
	TOP_LEVEL_LINK: '.wp-menu-name',
	SUBMENU_CONTAINER: '.wp-submenu',
	SUBMENU_ITEM: '.wp-submenu li a',
	SUBMENU_ITEM_TOP_LEVEL: '.wp-has-submenu',
};

const ADMIN_NAV_CLICK_EVENT = 'elementor/admin/nav-click';

const EVENT_ID_BY_SLUG = {
	'edit.php?post_type=elementor_library': 'saved_templates',
	'elementor-app': 'theme_builder',
};

class NavigationTracking extends BaseTracking {
	static init() {
		if ( WpDashboardTracking.isEditorOneActive() ) {
			this.attachSidebarNavigationTracking();
			this.attachElementorHomeMenuTracking();
		} else {
			this.attachElementorMenuTracking();
			this.attachTemplatesMenuTracking();
		}
	}

	static attachTemplatesMenuTracking() {
		const templatesMenu = document.querySelector( ELEMENTOR_MENU_SELECTORS.TEMPLATES_TOP_LEVEL );

		if ( ! templatesMenu ) {
			return;
		}

		this.attachMenuTracking( templatesMenu, 'Templates' );
	}

	static attachElementorHomeMenuTracking() {
		const elementorHomeMenu = document.querySelector( ELEMENTOR_MENU_SELECTORS.ELEMENTOR_HOME_TOP_LEVEL );

		if ( ! elementorHomeMenu ) {
			return;
		}

		this.attachMenuTracking( elementorHomeMenu, 'Elementor' );
	}

	static attachElementorMenuTracking() {
		const elementorMenu = document.querySelector( ELEMENTOR_MENU_SELECTORS.ELEMENTOR_TOP_LEVEL );

		if ( ! elementorMenu ) {
			return;
		}

		this.attachMenuTracking( elementorMenu, 'Elementor' );
	}

	static attachSidebarNavigationTracking() {
		this.addEventListenerTracked(
			window,
			ADMIN_NAV_CLICK_EVENT,
			( event ) => {
				const { itemId, rootItem } = event.detail;

				WpDashboardTracking.trackNavClicked( itemId, rootItem || null, NAV_AREAS.SIDEBAR_MENU );
			},
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
		const slug = href ? this.extractSlugFromHref( href ) : null;
		const eventId = slug ? this.deriveEventIdFromSlug( slug ) : '';

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

	static extractSlugFromHref( href ) {
		const urlParams = new URLSearchParams( href.split( '?' )[ 1 ] || '' );
		const page = urlParams.get( 'page' );

		if ( page ) {
			return page;
		}

		const postType = urlParams.get( 'post_type' );

		return postType ? `edit.php?post_type=${ postType }` : null;
	}

	static deriveEventIdFromSlug( slug ) {
		if ( EVENT_ID_BY_SLUG[ slug ] ) {
			return EVENT_ID_BY_SLUG[ slug ];
		}

		return slug
			.replace( /^elementor-/, '' )
			.replace( /[?#].*$/, '' )
			.replace( /[- ]/g, '_' )
			.toLowerCase();
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
