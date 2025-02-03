var TemplateLibraryTemplateLocalView = require( 'elementor-templates/views/template/local' ),
	TemplateLibraryTemplateCloudView;

TemplateLibraryTemplateCloudView = TemplateLibraryTemplateLocalView.extend( {
	onPreviewButtonClick() {
		if ( 'FOLDER' === this.model.get( 'subType' ) ) {
			$e.route( 'library/view-folder', { model: this.model } );
			return;
		}

		TemplateLibraryTemplateLocalView.prototype.onPreviewButtonClick.apply( this, arguments );
	},
} );

module.exports = TemplateLibraryTemplateCloudView;
