import LandingPagesHandler from './landing-pages';

export default class extends elementorModules.Module {
	constructor() {
		super();

		elementorCommon.elements.$window.on( 'elementor/admin/init', () => {
			this.runHandler();
		} );
	}

	runHandler() {
		const paths = {
				landingPagesTablePage: 'edit.php?post_type=page&elementor_library_type=landing-page',
				landingPagesAddNewPage: 'edit.php?post_type=elementor_library&page=landing-page',
			},
			args = {
				path: elementorAdmin.config.landingPages?.landingPagesHasPages ? paths.landingPagesTablePage : paths.landingPagesAddNewPage,
				isLandingPageAdminEdit: elementorAdmin.config.landingPages?.isLandingPageAdminEdit,
				paths,
			};

		// This class modifies elements in the WordPress admin that are rendered "wrong" by the WordPress core
		// and could not be modified in the backend.
		new LandingPagesHandler( args );
	}
}
