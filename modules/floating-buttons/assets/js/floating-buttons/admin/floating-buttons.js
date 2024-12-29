import AdminMenuHandler from 'elementor-admin/menu-handler';

export default class FloatingButtonsHandler extends AdminMenuHandler {
	getDefaultSettings() {
		const pageName = 'e-floating-buttons',
			adminMenuSelectors = {
				// The escaping is done because jQuery requires it for selectors.
				contactPagesTablePage: 'a[href="edit.php?post_type=' + pageName + '"]',
				contactPagesAddNewPage: 'a[href="edit.php?post_type=elementor_library&page=' + pageName + '"]',
			};

		return {
			selectors: {
				addButton: '.page-title-action:first',
				templatesMenuItem: '.menu-icon-elementor_library',
				contactPagesMenuItem: `${ adminMenuSelectors.contactPagesTablePage }, ${ adminMenuSelectors.contactPagesAddNewPage }`,
			},
		};
	}

	getDefaultElements() {
		const selectors = this.getSettings( 'selectors' ),
			elements = super.getDefaultElements();

		elements.$templatesMenuItem = jQuery( selectors.templatesMenuItem );
		elements.$contactPagesMenuItem = jQuery( selectors.contactPagesMenuItem );
		return elements;
	}

	onInit() {
		super.onInit();

		const settings = this.getSettings(),
			isContactPagesTablePage = !! window.location.href.includes( settings.paths.contactPagesTablePage ),
			isContactPagesTrashPage = !! window.location.href.includes( settings.paths.contactPagesTrashPage ),
			isLContactPagesCreateYourFirstPage = !! window.location.href.includes( settings.paths.contactPagesAddNewPage );

		// We need this because there is a complex bug in the WordPress admin menu that causes the Contact Menu to be broken
		// When the links page has at least one post and the contact page has none.
		if ( elementorAdminConfig.urls?.viewContactPageUrl ) {
			this.elements.$templatesMenuItem.find( 'li.submenu-e-contact a' )
				.attr( 'href', elementorAdminConfig.urls.viewContactPageUrl );
		}

		if ( isContactPagesTablePage || isContactPagesTrashPage || isLContactPagesCreateYourFirstPage ) {
			this.highlightTopLevelMenuItem( this.elements.$templatesMenuItem, this.elements.$pagesMenuItemAndLink );

			this.highlightSubMenuItem( this.elements.$contactPagesMenuItem );

			jQuery( settings.selectors.addButton ).attr( 'href', elementorAdminConfig.urls.addNewLinkUrlContact );
		}
	}
}
