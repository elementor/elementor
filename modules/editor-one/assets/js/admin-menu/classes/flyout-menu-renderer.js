export class FlyoutMenuRenderer {
	constructor( config ) {
		this.config = config;
	}

	render() {
		const { editorFlyout } = this.config;

		if ( ! editorFlyout || ! editorFlyout.items || ! editorFlyout.items.length ) {
			return false;
		}

		const editorLi = this.findEditorInMenu( `#toplevel_page_elementor-home` );

		if ( ! editorLi ) {
			return false;
		}

		editorLi.classList.add( 'elementor-has-flyout' );

		const editorFlyoutUl = document.createElement( 'ul' );
		editorFlyoutUl.className = 'elementor-submenu-flyout elementor-level-3';

		let dividerAdded = false;

		editorFlyout.items.forEach( ( item ) => {
			if ( editorFlyout.has_third_party_items && item.is_third_party && ! dividerAdded ) {
				const dividerLi = document.createElement( 'li' );
				dividerLi.className = 'elementor-flyout-divider';
				dividerLi.setAttribute( 'role', 'separator' );
				editorFlyoutUl.appendChild( dividerLi );
				dividerAdded = true;
			}

			const li = document.createElement( 'li' );
			li.setAttribute( 'data-group-id', item.group_id || '' );

			if ( item.is_third_party ) {
				li.classList.add( 'elementor-third-party-item' );
			}

			const a = document.createElement( 'a' );
			a.href = item.url;
			a.textContent = item.label;

			li.appendChild( a );

			editorFlyoutUl.appendChild( li );
		} );

		editorLi.appendChild( editorFlyoutUl );

		return true;
	}

	findEditorInMenu( menuSelector ) {
		const menuItem = document.querySelector( menuSelector );

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

