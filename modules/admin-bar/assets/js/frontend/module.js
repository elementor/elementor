/* global elementorAdminBarConfig, jQuery */
class AdminBar extends elementorModules.ViewModule {
	/**
	 * @returns {{}}
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
			},
		};
	}

	/**
	 * @returns {{$adminBar: (jQuery)}}
	 */
	getDefaultElements() {
		const { adminBar } = this.getSettings( 'selectors' );

		return {
			$adminBar: jQuery( adminBar ),
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
	 * @param adminBarConfig
	 */
	createMenu( adminBarConfig ) {
		this.elements.$adminBar.append(
			this.createMenuItems( Object.values( adminBarConfig ) )
		);
	}

	/**
	 * Creates a menu items from array of declaration.
	 *
	 * @param items
	 * @returns {jQuery[]}
	 */
	createMenuItems( items ) {
		return items.map( ( item ) => this.createMenuItem( item ) );
	}

	/**
	 * Creates a menu item, both for menu and sub menu.
	 *
	 * @param item
	 * @returns {jQuery}
	 */
	createMenuItem( item ) {
		const children = item.children ? Object.values( item.children ) : [];

		const id = `${ this.getSettings( 'prefixes.adminBarId' ) }${ item.id }`;

		const $title = jQuery( '<span>', {
			class: this.getSettings( 'classes.adminBarItemTitle' ),
			html: item.title,
		} );

		const $subTitle = item.sub_title ?
			jQuery( '<span>', {
				class: this.getSettings( 'classes.adminBarItemSubTitle' ),
				html: item.sub_title,
			} ) :
			null;

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
			class: children.length ? 'menupop' : '',
		} ).append( [ $item, children.length ? this.createSubMenuItems( id, children ) : null ] );
	}

	/**
	 * Creates sub menu items wrapper.
	 *
	 * @param parentId
	 * @param children
	 * @returns {jQuery}
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

jQuery( () => new AdminBar() );
