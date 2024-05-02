import AdminMenuHandler from 'elementor-admin/menu-handler';

export default class LinksPagesHandler extends AdminMenuHandler {
	getDefaultSettings() {
		const pageName = 'e-link-pages',
			adminMenuSelectors = {
				// The escaping is done because jQuery requires it for selectors.
				linksPagesTablePage: 'a[href="edit.php?post_type=' + pageName + '"]',
				linksPagesAddNewPage: 'a[href="edit.php?post_type=elementor_library&page=' + pageName + '"]',
			};

		return {
			selectors: {
				addButton: '.page-title-action:first',
				pagesMenuItemAndLink: '#menu-pages, #menu-pages > a',
				linksPagesMenuItem: `${ adminMenuSelectors.linksPagesTablePage }, ${ adminMenuSelectors.linksPagesAddNewPage }`,
				templatesMenuItem: '.menu-icon-elementor_library',
			},
		};
	}

	getDefaultElements() {
		const selectors = this.getSettings( 'selectors' ),
			elements = super.getDefaultElements();

		elements.$landingPagesMenuItem = jQuery( selectors.linksPagesMenuItem );
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

		// If the current page is a Landing Pages Page (the Posts Table page, "Create Your First.." page, or a native
		// WordPress dashboard page edit screen when using WordPress' Classic Editor).
		if ( isLinksPagesTablePage || isLinksPagesTrashPage || isLinksPagesCreateYourFirstPage || settings.isLinksPageAdminEdit ) {
			// Make sure the active admin top level menu item is 'Templates', and not 'Pages'.
			this.highlightTopLevelMenuItem( this.elements.$templatesMenuItem, this.elements.$pagesMenuItemAndLink );

			this.highlightSubMenuItem( this.elements.$landingPagesMenuItem );

			// Overwrite the 'Add New' button at the top of the page to open in Elementor with the library module open.
			jQuery( settings.selectors.addButton ).attr( 'href', elementorAdminConfig.urls.addNewLinkUrl );
		}
	}
}
