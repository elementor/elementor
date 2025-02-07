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

	onDeleteButtonClick() {
		if ( 'FOLDER' === this.model.get( 'subType' ) ) {
			this.handleDeleteFolderClick();
			return;
		}

		TemplateLibraryTemplateLocalView.prototype.onDeleteButtonClick.apply( this, arguments );
	},

	handleDeleteFolderClick() {
		const toggleMoreIcon = this.ui.toggleMoreIcon;

		elementor.templates.deleteFolder( this.model, {
			onConfirm() {
				toggleMoreIcon.removeClass( 'eicon-ellipsis-h' ).addClass( 'eicon-loading eicon-animation-spin' );
			},
			onSuccess() {
				elementor.templates.showTemplates();
			},
		} );
	},
} );

module.exports = TemplateLibraryTemplateCloudView;
