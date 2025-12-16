export class SidebarMenuHandler {
	constructor() {
		console.log( 'SidebarMenuHandler' );
		const elementorHomeMenu = this.findElementorHomeMenu();
		console.log( 'elementorHomeMenu', elementorHomeMenu );
		if ( elementorHomeMenu ) {
			this.activeMenu = elementorHomeMenu;
			this.deactivateOtherMenus();
			this.activateElementorMenu();
			this.highlightSubmenu();
		}
	}

	findElementorHomeMenu() {
		return document.querySelector( '#toplevel_page_elementor-home' );
	}

	deactivateOtherMenus() {
		document.querySelectorAll( '#adminmenu li.wp-has-current-submenu' ).forEach( ( item ) => {
			if ( item !== this.activeMenu ) {
				item.classList.remove( 'wp-has-current-submenu', 'wp-menu-open', 'selected' );
				item.classList.add( 'wp-not-current-submenu' );

				const link = item.querySelector( ':scope > a' );
				if ( link ) {
					link.classList.remove( 'wp-has-current-submenu', 'wp-menu-open', 'current' );
				}
			}
		} );
	}

	activateElementorMenu() {
		this.activeMenu.classList.remove( 'wp-not-current-submenu' );
		this.activeMenu.classList.add( 'wp-has-current-submenu', 'wp-menu-open', 'selected' );

		const elementorLink = this.activeMenu.querySelector( ':scope > a.menu-top' );
		if ( elementorLink ) {
			elementorLink.classList.add( 'wp-has-current-submenu', 'wp-menu-open' );
		}
	}

	highlightSubmenu() {
		const currentUrl = new URL( window.location.href );
		const searchParams = currentUrl.searchParams;
		const page = searchParams.get( 'page' );

		let targetSlug = 'elementor-editor';

		if ( 'elementor' === page || 'elementor-home' === page ) {
			targetSlug = 'elementor-editor';
		} else if ( 'e-form-submissions' === page ) {
			targetSlug = 'e-form-submissions';
		} else if ( 'elementor-theme-builder' === page ) {
			targetSlug = 'elementor-theme-builder';
		}

		const submenuItems = this.activeMenu.querySelectorAll( '.wp-submenu li' );

		submenuItems.forEach( ( item ) => {
			const link = item.querySelector( 'a' );
			if ( ! link ) {
				return;
			}

			item.classList.remove( 'current' );
			link.classList.remove( 'current' );
			link.setAttribute( 'aria-current', '' );

			const linkUrl = new URL( link.href, window.location.origin );
			const linkPage = linkUrl.searchParams.get( 'page' );

			if ( linkPage === targetSlug ) {
				item.classList.add( 'current' );
				link.classList.add( 'current' );
				link.setAttribute( 'aria-current', 'page' );
			}
		} );
	}
}

