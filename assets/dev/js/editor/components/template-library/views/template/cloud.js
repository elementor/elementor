var TemplateLibraryTemplateLocalView = require( 'elementor-templates/views/template/local' ),
	TemplateLibraryTemplateCloudView;

TemplateLibraryTemplateCloudView = TemplateLibraryTemplateLocalView.extend( {
	className() {
		const view = elementor.templates.getViewSelection(),
			subType = 'FOLDER' === this.model.get( 'subType' ) ? 'folder' : 'template';

		let classes = TemplateLibraryTemplateLocalView.prototype.className.apply( this, arguments );

		classes += ' elementor-template-library-template-view-' + view;
		classes += ' elementor-template-library-template-type-' + subType;

		return classes;
	},

	events() {
		return _.extend( TemplateLibraryTemplateLocalView.prototype.events.apply( this, arguments ), {
			click: 'viewFolder',
		} );
	},

	onPreviewButtonClick() {
		if ( 'FOLDER' === this.model.get( 'subType' ) ) {
			$e.route( 'library/view-folder', { model: this.model } );
			return;
		}

		TemplateLibraryTemplateLocalView.prototype.onPreviewButtonClick.apply( this, arguments );
	},

	viewFolder() {
		if ( 'FOLDER' === this.model.get( 'subType' ) ) {
			$e.route( 'library/view-folder', { model: this.model } );
		}
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
				$e.routes.refreshContainer( 'library' );
			},
		} );
	},
} );

module.exports = TemplateLibraryTemplateCloudView;
