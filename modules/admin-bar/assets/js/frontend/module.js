/* global elementorAdminBarConfig */
class AdminBar extends elementorModules.ViewModule {
	/**
	 * @return {{}} settings
	 */
	getDefaultSettings() {
		return {
			prefixes: {
				adminBarId: 'wp-admin-bar-',
			},
			classes: {
				adminBarItem: 'ab-item',
				adminBarItemTitle: 'elementor-edit-link-title',
				adminBarItemSubTitle: 'elementor-edit-link-type',
				adminBarNonLinkItem: 'ab-empty-item',
				adminBarSubItemsWrapper: 'ab-sub-wrapper',
				adminBarSubItems: 'ab-submenu',
			},
			selectors: {
				adminBar: '#wp-admin-bar-root-default',
				editMenuItem: '#wp-admin-bar-edit',
				newMenuItem: '#wp-admin-bar-new-content',
			},
		};
	}

	/**
	 * @return {{$adminBar: (jQuery)}} elements
	 */
	getDefaultElements() {
		const { adminBar, editMenuItem, newMenuItem } = this.getSettings( 'selectors' );

		return {
			$adminBar: jQuery( adminBar ),
			$editMenuItem: jQuery( editMenuItem ),
			$newMenuItem: jQuery( newMenuItem ),
		};
	}

	/**
	 * Init
	 */
	onInit() {
		super.onInit();

		this.createMenu( elementorAdminBarConfig );
	}

	/**
	 * Main method that creates the menu base on the config that provided.
	 *
	 * @param {*} adminBarConfig
	 */
	createMenu( adminBarConfig ) {
		const $items = this.createMenuItems( Object.values( adminBarConfig ) );

		if ( this.elements.$editMenuItem.length ) {
			// This is the normal case, when user visit a preview page of single post.
			this.elements.$editMenuItem.after( $items );
		} else if ( this.elements.$newMenuItem.length ) {
			// This is another case, when user visit a preview page that cannot be edited e.g: archive page.
			this.elements.$newMenuItem.after( $items );
		} else {
			// Default fallback in case there are no "new" or "edit" button.
			this.elements.$adminBar.append( $items );
		}
	}

	/**
	 * Creates a menu items from array of declaration.
	 *
	 * @param {*} items
	 * @return {jQuery[]} menu items
	 */
	createMenuItems( items ) {
		return items.map( ( item ) => this.createMenuItem( item ) );
	}

	/**
	 * Creates a menu item, both for menu and sub menu.
	 *
	 * @param {*} item
	 * @return {jQuery} menu item
	 */
	createMenuItem( item ) {
		const children = item.children ? Object.values( item.children ) : [];

		const id = `${ this.getSettings( 'prefixes.adminBarId' ) }${ item.id }`;

		const $title = jQuery( '<span>', {
			class: this.getSettings( 'classes.adminBarItemTitle' ),
			html: item.title,
		} );

		const $subTitle = item.sub_title
			? jQuery( '<span>', {
				class: this.getSettings( 'classes.adminBarItemSubTitle' ),
				html: item.sub_title,
			} )
			: null;

		const $item = jQuery( item.href ? '<a>' : '<div>', {
			'aria-haspopup': children.length ? true : null,
			class: [
				this.getSettings( 'classes.adminBarItem' ),
				item.href ? '' : this.getSettings( 'classes.adminBarNonLinkItem' ),
				item.class,
			].join( ' ' ),
			href: item.href,
		} ).append( [ $title, $subTitle ] );

		return jQuery( '<li>', {
			id,
			class: children.length ? 'menupop' : '' + ( item.parent_class || 'elementor-general-section' ),
		} ).append( [ $item, children.length ? this.createSubMenuItems( id, children ) : null ] );
	}

	/**
	 * Creates sub menu items wrapper.
	 *
	 * @param {string} parentId
	 * @param {Object} children
	 * @return {jQuery} sub-menu items
	 */
	createSubMenuItems( parentId, children ) {
		const $list = jQuery( '<ul>', {
			class: this.getSettings( 'classes.adminBarSubItems' ),
			id: `${ parentId }-default`,
		} ).append( this.createMenuItems( children ) );

		return jQuery( '<div>', {
			class: this.getSettings( 'classes.adminBarSubItemsWrapper' ),
		} ).append( $list );
	}
}

document.addEventListener( 'DOMContentLoaded', () => new AdminBar() );
