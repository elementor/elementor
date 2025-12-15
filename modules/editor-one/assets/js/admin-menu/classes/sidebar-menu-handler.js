export class SidebarMenuHandler {
	constructor() {
		this.elementorMenu = document.querySelector( '#toplevel_page_elementor' );
	}

	handle() {
		if ( ! this.elementorMenu ) {
			return;
		}

		this.deactivateOtherMenus();
		this.activateElementorMenu();
		this.highlightSubmenu();
	}

	deactivateOtherMenus() {
		document.querySelectorAll( '#adminmenu li.wp-has-current-submenu' ).forEach( ( item ) => {
			if ( item !== this.elementorMenu ) {
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
		this.elementorMenu.classList.remove( 'wp-not-current-submenu' );
		this.elementorMenu.classList.add( 'wp-has-current-submenu', 'wp-menu-open', 'selected' );

		const elementorLink = this.elementorMenu.querySelector( ':scope > a.menu-top' );
		if ( elementorLink ) {
			elementorLink.classList.add( 'wp-has-current-submenu', 'wp-menu-open' );
		}
	}

	highlightSubmenu() {
		const currentUrl = new URL( window.location.href );
		const searchParams = currentUrl.searchParams;
		const page = searchParams.get( 'page' );

		let targetSlug = 'elementor-editor';

		if ( 'elementor' === page ) {
			targetSlug = 'elementor-editor';
		} else if ( 'e-form-submissions' === page ) {
			targetSlug = 'e-form-submissions';
		} else if ( 'elementor-theme-builder' === page ) {
			targetSlug = 'elementor-theme-builder';
		}

		const submenuItems = this.elementorMenu.querySelectorAll( '.wp-submenu li' );

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

