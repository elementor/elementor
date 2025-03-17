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

	ui() {
		return _.extend( TemplateLibraryTemplateLocalView.prototype.ui.apply( this, arguments ), {
			toggleMore: '.elementor-template-library-template-more-toggle',
			previewImg: '.elementor-template-library-template-thumbnail img',
		} );
	},

	events() {
		return _.extend( TemplateLibraryTemplateLocalView.prototype.events.apply( this, arguments ), {
			click: 'viewFolder',
			'click @ui.toggleMore': 'onToggleMoreClick',
		} );
	},

	modelEvents: _.extend( {}, TemplateLibraryTemplateLocalView.prototype.modelEvents, {
		'change:preview_url': 'onPreviewUrlChange',
	} ),

	onRender() {
		const previewUrl = this.model.get( 'preview_url' );

		if ( this.shouldGeneratePreview() ) {
			this.iframe = elementor.templates.layout.createScreenshotIframe( this.model.get( 'generate_preview_url' ) );
			this.isGeneratingPreview = true;
		}

		if ( previewUrl ) {
			this.updatePreviewImgStyle();
		}
	},

	onPreviewUrlChange() {
		const isCloudSource = 'cloud' === this.model.get( 'source' );
		const previewUrl = this.model.get( 'preview_url' );
		this.isGeneratingPreview = false;

		if ( isCloudSource && previewUrl ) {
			this.ui.previewImg.attr( 'src', previewUrl );
			this.updatePreviewImgStyle();
			this.model.set( 'generate_preview_url', null );
			this.iframe.remove();
		}
	},

	updatePreviewImgStyle() {
		this.ui.previewImg.css( 'object-fit', 'contain' );
	},

	needGeneratePreview() {
		const view = elementor.templates.getViewSelection();

		if ( 'grid' !== view ) {
			return false;
		}

		if ( 'FOLDER' === this.model.get( 'subType' ) ) {
			return false;
		}

		if ( this.model.get( 'preview_url' ) ) {
			return false;
		}

		if ( ! this.model.get( 'generate_preview_url' ) ) {
			return false;
		}

		if ( this.isGeneratingPreview ) {
			return false;
		}

		return true;
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

	onDeleteButtonClick( event ) {
		event.stopPropagation();
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
