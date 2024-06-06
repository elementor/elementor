import ConversionCenterHandler from './conversion-center';

export default class extends elementorModules.Module {
	constructor() {
		super();

		elementorCommon.elements.$window.on( 'elementor/admin/init', () => {
			this.runHandler();
		} );
	}

	runHandler() {
		const pageNameContact = 'e-contact-pages',
			paths = {
				contactPagesTablePage: 'edit.php?post_type=' + pageNameContact,
				contactPagesAddNewPage: 'edit.php?post_type=elementor_library&page=' + pageNameContact,
				contactPagesTrashPage: 'edit.php?post_status=trash&post_type=' + pageNameContact,
			},
			args = {
				paths,
			};

		// This class modifies elements in the WordPress admin that are rendered "wrong" by the WordPress core
		// and could not be modified in the backend.
		new ConversionCenterHandler( args );
	}
}
