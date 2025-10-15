import WpDashboardTracking, { NAV_AREAS } from '../wp-dashboard-tracking';
import BaseTracking from './base-tracking';

const ELEMENTOR_MENU_SELECTORS = {
	ELEMENTOR_TOP_LEVEL: 'li#toplevel_page_elementor',
	TEMPLATES_TOP_LEVEL: 'li#menu-posts-elementor_library',
	ADMIN_MENU: '#adminmenu',
	TOP_LEVEL_LINK: '.wp-menu-name',
	SUBMENU_CONTAINER: '.wp-submenu',
	SUBMENU_ITEM: '.wp-submenu li a',
	SUBMENU_ITEM_TOP_LEVEL: '.wp-has-submenu',
};

class NavigationTracking extends BaseTracking {
	static init() {
		this.attachElementorMenuTracking();
		this.attachTemplatesMenuTracking();
	}

	static attachElementorMenuTracking() {
		const elementorMenu = document.querySelector( ELEMENTOR_MENU_SELECTORS.ELEMENTOR_TOP_LEVEL );

		if ( ! elementorMenu ) {
			return;
		}

		this.attachMenuTracking( elementorMenu, 'Elementor' );
	}

	static attachTemplatesMenuTracking() {
		const templatesMenu = document.querySelector( ELEMENTOR_MENU_SELECTORS.TEMPLATES_TOP_LEVEL );

		if ( ! templatesMenu ) {
			return;
		}

		this.attachMenuTracking( templatesMenu, 'Templates' );
	}

	static attachMenuTracking( menuElement, menuName ) {
		const topLevelLink = menuElement.querySelector( 'a.menu-top' );
		const submenuContainer = menuElement.querySelector( ELEMENTOR_MENU_SELECTORS.SUBMENU_CONTAINER );

		if ( topLevelLink ) {
			this.addEventListenerTracked(
				topLevelLink,
				'click',
				( event ) => {
					this.handleTopLevelClick( event );
				},
			);
		}

		if ( submenuContainer ) {
			const submenuItems = submenuContainer.querySelectorAll( 'li a' );

			submenuItems.forEach( ( submenuItem ) => {
				this.addEventListenerTracked(
					submenuItem,
					'click',
					( event ) => {
						this.handleSubmenuClick( event, menuName );
					},
				);
			} );

			this.observeSubmenuChanges( submenuContainer, menuName );
		}
	}

	static observeSubmenuChanges( submenuContainer, menuName ) {
		this.addObserver(
			submenuContainer,
			{
				childList: true,
				subtree: false,
			},
			( mutations ) => {
				mutations.forEach( ( mutation ) => {
					if ( 'childList' === mutation.type ) {
						mutation.addedNodes.forEach( ( node ) => {
							if ( 1 === node.nodeType && 'LI' === node.tagName ) {
								const link = node.querySelector( 'a' );
								if ( link ) {
									this.addEventListenerTracked(
										link,
										'click',
										( event ) => {
											this.handleSubmenuClick( event, menuName );
										},
									);
								}
							}
						} );
					}
				} );
			},
		);
	}

	static handleTopLevelClick( event ) {
		const link = event.currentTarget;
		const itemId = this.extractItemId( link );
		const area = this.determineNavArea( link );

		WpDashboardTracking.trackNavClicked( itemId, null, area );
	}

	static handleSubmenuClick( event, menuName ) {
		const link = event.currentTarget;
		const itemId = this.extractItemId( link );
		const area = this.determineNavArea( link );

		WpDashboardTracking.trackNavClicked( itemId, menuName, area );
	}

	static extractItemId( link ) {
		const textContent = link.textContent.trim();

		if ( textContent ) {
			return textContent;
		}

		const href = link.getAttribute( 'href' );
		if ( href ) {
			const urlParams = new URLSearchParams( href.split( '?' )[ 1 ] || '' );
			const page = urlParams.get( 'page' );
			const postType = urlParams.get( 'post_type' );

			if ( page ) {
				return page;
			}

			if ( postType ) {
				return postType;
			}
		}

		const id = link.getAttribute( 'id' );
		if ( id ) {
			return id;
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
