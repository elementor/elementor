import LinksPagesHandler from './links-pages';

export default class extends elementorModules.Module {
	constructor() {
		super();

		elementorCommon.elements.$window.on( 'elementor/admin/init', () => {
			this.runHandler();
		} );
	}

	runHandler() {
		const pageNameLinks = 'e-link-pages',
			pageNameContact = 'e-contact-pages',
			paths = {
				linksPagesTablePage: 'edit.php?post_type=' + pageNameLinks,
				linksPagesAddNewPage: 'edit.php?post_type=elementor_library&page=' + pageNameLinks,
				linksPagesTrashPage: 'edit.php?post_status=trash&post_type=' + pageNameLinks,
				contactPagesTablePage: 'edit.php?post_type=' + pageNameContact,
				contactPagesAddNewPage: 'edit.php?post_type=elementor_library&page=' + pageNameContact,
				contactPagesTrashPage: 'edit.php?post_status=trash&post_type=' + pageNameContact,
			},
			args = {
				path: elementorAdmin.config.linksPages?.hasPages ? paths.linksPagesTablePage : paths.linksPagesAddNewPage,
				isLinksPageAdminEdit: elementorAdmin.config.linksPages?.isAdminEdit,
				paths,
			};

		// This class modifies elements in the WordPress admin that are rendered "wrong" by the WordPress core
		// and could not be modified in the backend.
		new LinksPagesHandler( args );
	}
}
