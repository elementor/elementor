import AdminMenuHandler from 'elementor-admin/admin-menu';

export default class LandingPagesHandler extends AdminMenuHandler {
	getDefaultSettings() {
		const adminMenuSelectors = {
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

		return elements;
	}

	highlightLandingPagesMenu( isLandingPagesTablePage ) {
		this.elements.$landingPagesMenuItem.parent()
			.addClass( 'current' );

		if ( isLandingPagesTablePage || this.getSettings( 'isCurrentPageLPAdminEdit' ) ) {
			jQuery( this.getSettings( 'selectors' ).pagesMenuItemAndLink ).removeClass( 'wp-has-current-submenu wp-menu-open' );
		}
	}

	onInit() {
		const settings = this.getSettings(),
			isLandingPagesTablePage = !! window.location.href.includes( settings.slugs.landingPagesTablePage ),
			isLandingPagesCreateYourFirstPage = !! window.location.href.includes( settings.slugs.landingPagesAddNewPage );

		super.onInit();

		// If the current page is a Landing Pages Page (the Posts Table page, "Create Your First.." page,
		// or WordPress native Admin edit page).
		if ( isLandingPagesTablePage || isLandingPagesCreateYourFirstPage ) {
			// Highlight the 'Templates' menu item and make sure the submenu is open
			this.elements.$templatesMenuItem.addClass( 'wp-has-current-submenu wp-menu-open' );

			// Make sure the active admin top level menu item is 'Campaigns', and not 'Pages'.
			this.highlightLandingPagesMenu( isLandingPagesTablePage );

			// Overwrite the 'Add New' button at the top of the page to open in Elementor with the library module open.
			jQuery( settings.selectors.addButton ).attr( 'href', elementorAdminConfig.urls.addNewLandingPageUrl );
		}

		if ( settings.isCurrentPageLPAdminEdit ) {
			this.highlightSubMenuItem( this.elements.$landingPagesMenuItem );
		}
	}
}
