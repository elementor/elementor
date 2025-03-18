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

	attributes() {
		if ( 'grid' === elementor.templates.getViewSelection() ) {
			const data = this.model.toJSON();

			return {
				'data-template_id': data.template_id,
			};
		}
    },

	ui() {
		return _.extend( TemplateLibraryTemplateLocalView.prototype.ui.apply( this, arguments ), {
			toggleMore: '.elementor-template-library-template-more-toggle',
			previewImg: '.elementor-template-library-template-thumbnail img',
		} );
	},

	events() {
		return _.extend( TemplateLibraryTemplateLocalView.prototype.events.apply( this, arguments ), {
			click: 'handleItemClicked',
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
		const previewUrl = this.model.get( 'preview_url' );
		this.isGeneratingPreview = false;

		if ( previewUrl ) {
			this.ui.previewImg.attr( 'src', previewUrl );
			this.updatePreviewImgStyle();
			this.model.set( 'generate_preview_url', null );
			this.iframe.remove();
		}
	},

	updatePreviewImgStyle() {
		this.ui.previewImg.css( 'object-fit', 'contain' );
	},

	shouldGeneratePreview() {
		const view = elementor.templates.getViewSelection();

		return 'FOLDER' !== this.model.get( 'subType' ) &&
			this.model.get( 'generate_preview_url' ) &&
			! this.model.get( 'preview_url' ) &&
			'grid' === view &&
			! this.isGeneratingPreview;
	},

	onPreviewButtonClick( event ) {
		if ( event.shiftKey ) {
			return;
		}

		if ( 'FOLDER' === this.model.get( 'subType' ) ) {
			$e.route( 'library/view-folder', { model: this.model } );
			return;
		}

		TemplateLibraryTemplateLocalView.prototype.onPreviewButtonClick.apply( this, arguments );
	},

	handleItemClicked( event ) {
		if ( 'list' === elementor.templates.getViewSelection() ) {
			return;
		}

		if ( event.shiftKey ) {
			this.handleShiftAndClick();

			return;
		}

		if ( 'FOLDER' === this.model.get( 'subType' ) ) {
			$e.route( 'library/view-folder', { model: this.model } );
		}
	},

	handleShiftAndClick() {
		const itemIsSelected = this.$el.hasClass( 'bulk-selected-item' );

		if ( itemIsSelected ) {
			elementor.templates.removeBulkSelectionItem( this.model.get( 'template_id' ) );
		} else {
			elementor.templates.addBulkSelectionItem( this.model.get( 'template_id' ) );
		}

		this.$el.toggleClass( 'bulk-selected-item' );
		elementor.templates.layout.handleBulkActionBar();
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
