import AdminMenuHandler from 'elementor-admin/admin-menu';

export default class LandingPagesHandler extends AdminMenuHandler {
	getDefaultSettings() {
		const adminMenuSelectors = {
				// The escaping is done because jQuery requires it for selectors.
				landingPagesTablePage: 'a[href=\"edit.php?post_type=page&elementor_library_type=landing-page\"]',
				landingPagesAddNewPage: 'a[href=\"edit.php?post_type=elementor_library&page=landing-page\"]',
			};

		return {
			selectors: {
				addButton: '.page-title-action:first',
				pagesMenuItemAndLink: '#menu-pages, #menu-pages > a',
				landingPagesMenuItem: `${ adminMenuSelectors.landingPagesTablePage }, ${ adminMenuSelectors.landingPagesAddNewPage }`,
				templatesMenuItem: '.menu-icon-elementor_library',
			},
		};
	}

	getDefaultElements() {
		const selectors = this.getSettings( 'selectors' ),
			elements = super.getDefaultElements();

		elements.$landingPagesMenuItem = jQuery( selectors.landingPagesMenuItem );
		elements.$templatesMenuItem = jQuery( selectors.templatesMenuItem );
		elements.$pagesMenuItemAndLink = jQuery( selectors.pagesMenuItemAndLink );

		return elements;
	}

	onInit() {
		super.onInit();

		const settings = this.getSettings(),
			isLandingPagesTablePage = !! window.location.href.includes( settings.paths.landingPagesTablePage ),
			isLandingPagesCreateYourFirstPage = !! window.location.href.includes( settings.paths.landingPagesAddNewPage );

		// If the current page is a Landing Pages Page (the Posts Table page, "Create Your First.." page, or a native
		// WordPress dashboard page edit screen when using WordPress' Classic Editor).
		if ( isLandingPagesTablePage || isLandingPagesCreateYourFirstPage || settings.isLandingPageAdminEdit ) {
			// Make sure the active admin top level menu item is 'Templates', and not 'Pages'.
			this.highlightTopLevelMenuItem( this.elements.$templatesMenuItem, this.elements.$pagesMenuItemAndLink );

			this.highlightSubMenuItem( this.elements.$landingPagesMenuItem );

			// Overwrite the 'Add New' button at the top of the page to open in Elementor with the library module open.
			jQuery( settings.selectors.addButton ).attr( 'href', elementorAdminConfig.urls.addNewLandingPageUrl );
		}
	}
}
