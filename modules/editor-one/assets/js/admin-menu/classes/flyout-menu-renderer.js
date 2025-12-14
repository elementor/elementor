export class FlyoutMenuRenderer {
	constructor( config ) {
		this.config = config || {};
		this.menuItems = this.config.menuItems || [];
	}

	render() {
		if ( ! this.menuItems.length ) {
			return false;
		}

		this.menuItems.forEach( ( item ) => {
			if ( item.type === 'flyout' && item.parentSlug ) {
				this.createFlyoutMenu( item );
			}
		} );

		return true;
	}

	createFlyoutMenu( item ) {
		const parentMenuItem = this.findMenuItemBySlug( item.slug );

		if ( ! parentMenuItem ) {
			console.warn( 'Editor One: Could not find parent menu item for', item.slug );
			return;
		}

		const flyoutContainer = this.createFlyoutContainer( item );
		const flyoutContent = this.createFlyoutContent( item );

		flyoutContainer.appendChild( flyoutContent );
		parentMenuItem.appendChild( flyoutContainer );

		console.log( 'Editor One: Created flyout menu for', item.slug, parentMenuItem );
	}

	findMenuItemBySlug( slug ) {
		const rootSlug = 'elementor-one';
		const menuItem = document.querySelector( `#toplevel_page_${ rootSlug }` );

		if ( ! menuItem ) {
			console.warn( 'Editor One: Root menu item not found', rootSlug );
			return null;
		}

		const submenuLinks = menuItem.querySelectorAll( '.wp-submenu a' );

		for ( const link of submenuLinks ) {
			const href = link.getAttribute( 'href' );

			if ( ! href ) {
				continue;
			}

			if ( this.isUrl( slug ) ) {
				if ( href === slug || href.indexOf( slug ) !== -1 ) {
					return link.closest( 'li' );
				}
			} else {
				if ( href.indexOf( `page=${ slug }` ) !== -1 || href.indexOf( `page=${ slug }&` ) !== -1 ) {
					return link.closest( 'li' );
				}
			}
		}

		console.warn( 'Editor One: Menu item not found for slug', slug );
		return null;
	}

	isUrl( slug ) {
		if ( ! slug ) {
			return false;
		}

		return slug.indexOf( 'http' ) === 0 || slug.indexOf( 'admin.php' ) !== -1 || slug.indexOf( '#' ) !== -1;
	}

	createFlyoutContainer( item ) {
		const container = document.createElement( 'div' );
		container.className = 'e-flyout-menu-container';
		container.setAttribute( 'data-flyout-slug', item.slug );

		return container;
	}

	createFlyoutContent( item ) {
		const content = document.createElement( 'div' );
		content.className = 'e-flyout-menu-content';

		const title = document.createElement( 'div' );
		title.className = 'e-flyout-menu-title';
		title.textContent = item.label;

		const menuList = document.createElement( 'ul' );
		menuList.className = 'e-flyout-menu-list';

		if ( item.children && item.children.length ) {
			item.children.forEach( ( child ) => {
				const listItem = this.createFlyoutMenuItem( child );
				menuList.appendChild( listItem );
			} );
		}

		content.appendChild( title );
		content.appendChild( menuList );

		return content;
	}

	createFlyoutMenuItem( child ) {
		const listItem = document.createElement( 'li' );
		listItem.className = 'e-flyout-menu-item';

		const link = document.createElement( 'a' );
		link.href = child.url || '#';
		link.textContent = child.label;
		link.className = 'e-flyout-menu-link';

		if ( child.url ) {
			link.addEventListener( 'click', ( e ) => {
				if ( ! child.external ) {
					e.preventDefault();
					window.location.href = child.url;
				}
			} );
		}

		listItem.appendChild( link );

		return listItem;
	}
}

