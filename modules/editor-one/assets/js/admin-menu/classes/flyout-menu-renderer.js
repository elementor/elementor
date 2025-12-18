export class FlyoutMenuRenderer {
	constructor( config ) {
		this.config = config;
	}

	render() {
		const { editorFlyout } = this.config;

		if ( ! editorFlyout || ! editorFlyout.items || ! editorFlyout.items.length ) {
			return false;
		}

		const editorLi = this.findEditorMenuItem();

		if ( ! editorLi ) {
			return false;
		}

		editorLi.classList.add( 'elementor-has-flyout' );

		const editorFlyoutUl = document.createElement( 'ul' );
		editorFlyoutUl.className = 'elementor-submenu-flyout elementor-level-3';

		editorFlyout.items.forEach( ( item ) => {
			const li = document.createElement( 'li' );
			li.setAttribute( 'data-group-id', item.group_id || '' );

			const a = document.createElement( 'a' );
			a.href = item.url;
			a.textContent = item.label;

			li.appendChild( a );

			editorFlyoutUl.appendChild( li );
		} );

		editorLi.appendChild( editorFlyoutUl );

		return true;
	}

	findEditorMenuItem() {
		let elementorMenu = document.querySelector( '#adminmenu a[href="admin.php?page=elementor"]' );

		if ( ! elementorMenu ) {
			elementorMenu = document.querySelector( '#adminmenu .toplevel_page_elementor' );
		}

		if ( ! elementorMenu ) {
			return null;
		}

		const menuItem = elementorMenu.closest( 'li.menu-top' );

		if ( ! menuItem ) {
			return null;
		}

		const submenu = menuItem.querySelector( '.wp-submenu' );

		if ( ! submenu ) {
			return null;
		}

		const editorItem = submenu.querySelector( 'a[href*="elementor-editor"]' );

		if ( ! editorItem ) {
			return null;
		}

		return editorItem.closest( 'li' );
	}
}

