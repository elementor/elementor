var TemplateLibraryTemplateLocalView = require( 'elementor-templates/views/template/local' ),
	TemplateLibraryTemplateCloudView;

TemplateLibraryTemplateCloudView = TemplateLibraryTemplateLocalView.extend( {
	ui() {
		return _.extend( TemplateLibraryTemplateLocalView.prototype.ui.apply( this, arguments ), {
			folderItem: '.elementor-template-library-local-column-1',
		} );
	},

	events() {
		return jQuery.extend( TemplateLibraryTemplateLocalView.prototype.events.apply( this, arguments ), {
			'click @ui.folderItem': 'onFolderClick',
		} );
	},

	onFolderClick() {
		if ( 'FOLDER' !== this.model.get( 'subType' ) ) {
			return;
		}

		$e.route( 'library/view-folder', { model: this.model } );
	},
} );

module.exports = TemplateLibraryTemplateCloudView;
