import AdminMenuHandler from 'elementor-admin/menu-handler';

export default class LinksPagesHandler extends AdminMenuHandler {
	getDefaultSettings() {
		return {
			selectors: {
				addButton: '.page-title-action:first',
				conversionMenuItem: '.menu-item-elementor-conversions',
			},
		};
	}

	getDefaultElements() {
		const selectors = this.getSettings( 'selectors' ),
			elements = super.getDefaultElements();

		elements.$conversionMenuItem = jQuery( selectors.conversionMenuItem );

		return elements;
	}

	onInit() {
		super.onInit();

		const settings = this.getSettings(),
			isLinksPagesTablePage = !! window.location.href.includes( settings.paths.linksPagesTablePage ),
			isLinksPagesTrashPage = !! window.location.href.includes( settings.paths.linksPagesTrashPage ),
			isLinksPagesCreateYourFirstPage = !! window.location.href.includes( settings.paths.linksPagesAddNewPage ),
			isContactPagesTablePage = !! window.location.href.includes( settings.paths.contactPagesTablePage ),
			isContactPagesTrashPage = !! window.location.href.includes( settings.paths.contactPagesTrashPage ),
			isLContactPagesCreateYourFirstPage = !! window.location.href.includes( settings.paths.contactPagesAddNewPage );

		// We need this because there is a complex bug in the WordPress admin menu that causes the Contact Menu to be broken
		// When the links page has at least one post and the contact page has none.
		if ( elementorAdminConfig.urls?.viewContactPageUrl ) {
			this.elements.$conversionMenuItem.find( 'li.submenu-e-contact a' )
				.attr( 'href', elementorAdminConfig.urls.viewContactPageUrl );
		}

		if ( isLinksPagesTablePage || isLinksPagesTrashPage || isLinksPagesCreateYourFirstPage || settings.isLinksPageAdminEdit ) {
			const activeClasses = 'wp-has-current-submenu wp-menu-open current';

			this.elements.$conversionMenuItem
				.addClass( activeClasses )
				.removeClass( 'wp-not-current-submenu' );

			this.elements.$conversionMenuItem.find( 'li.submenu-e-links' ).addClass( 'current' );

			// Overwrite the 'Add New' button at the top of the page to open in Elementor with the library module open.
			jQuery( settings.selectors.addButton ).attr( 'href', elementorAdminConfig.urls.addNewLinkUrl );
		}

		if ( isContactPagesTablePage || isContactPagesTrashPage || isLContactPagesCreateYourFirstPage ) {
			const activeClasses = 'wp-has-current-submenu wp-menu-open current';

			this.elements.$conversionMenuItem
				.addClass( activeClasses )
				.removeClass( 'wp-not-current-submenu' );

			this.elements.$conversionMenuItem.find( 'li.submenu-e-contact' ).addClass( 'current' );

			// Overwrite the 'Add New' button at the top of the page to open in Elementor with the library module open.
			jQuery( settings.selectors.addButton ).attr( 'href', elementorAdminConfig.urls.addNewLinkUrl );
		}
	}
}
