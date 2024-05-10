import AdminMenuHandler from 'elementor-admin/menu-handler';

export default class LinksPagesHandler extends AdminMenuHandler {
	getDefaultSettings() {
		return {
			selectors: {
				addButton: '.page-title-action:first',
				pagesMenuItemAndLink: '#menu-pages, #menu-pages > a',
<<<<<<< HEAD
				templatesMenuItem: '#toplevel_page_e-link-pages-',
=======
				templatesMenuItem: '.menu-item-elementor-conversions',
>>>>>>> elementor/main
			},
		};
	}

	getDefaultElements() {
		const selectors = this.getSettings( 'selectors' ),
			elements = super.getDefaultElements();

		elements.$templatesMenuItem = jQuery( selectors.templatesMenuItem );
		elements.$pagesMenuItemAndLink = jQuery( selectors.pagesMenuItemAndLink );

		return elements;
	}

	onInit() {
		super.onInit();

		const settings = this.getSettings(),
			isLinksPagesTablePage = !! window.location.href.includes( settings.paths.linksPagesTablePage ),
			isLinksPagesTrashPage = !! window.location.href.includes( settings.paths.linksPagesTrashPage ),
			isLinksPagesCreateYourFirstPage = !! window.location.href.includes( settings.paths.linksPagesAddNewPage );

		if ( isLinksPagesTablePage || isLinksPagesTrashPage || isLinksPagesCreateYourFirstPage || settings.isLinksPageAdminEdit ) {
			const activeClasses = 'wp-has-current-submenu wp-menu-open current';

			this.elements.$templatesMenuItem
				.addClass( activeClasses )
				.removeClass( 'wp-not-current-submenu' );

			this.elements.$templatesMenuItem.find( 'li.wp-first-item' ).addClass( 'current' );

			// Overwrite the 'Add New' button at the top of the page to open in Elementor with the library module open.
			jQuery( settings.selectors.addButton ).attr( 'href', elementorAdminConfig.urls.addNewLinkUrl );
		}
	}
}
