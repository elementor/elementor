import LandingPagesHandler from './links-pages';

export default class extends elementorModules.Module {
	constructor() {
		super();

		elementorCommon.elements.$window.on( 'elementor/admin/init', () => {
			this.runHandler();
		} );
	}

	runHandler() {
		const pageName = 'e-link-pages',
			paths = {
				linksPagesTablePage: 'edit.php?post_type=' + pageName,
				linksPagesAddNewPage: 'edit.php?post_type=elementor_library&page=' + pageName,
				linksPagesTrashPage: 'edit.php?post_status=trash&post_type=' + pageName,
			},
			args = {
				path: elementorAdmin.config.linksPages?.hasPages ? paths.linksPagesTablePage : paths.linksPagesAddNewPage,
				isLandingPageAdminEdit: elementorAdmin.config.linksPages?.isAdminEdit,
				paths,
			};

		// This class modifies elements in the WordPress admin that are rendered "wrong" by the WordPress core
		// and could not be modified in the backend.
		new LandingPagesHandler( args );
	}
}
