const TemplateLibraryTemplateView = require( 'elementor-templates/views/template/base' );

import { SAVE_CONTEXTS } from './../../constants';

const TemplateLibraryTemplateLocalView = TemplateLibraryTemplateView.extend( {
	template: '#tmpl-elementor-template-library-template-local',

	ui() {
		return _.extend( TemplateLibraryTemplateView.prototype.ui.apply( this, arguments ), {
			deleteButton: '.elementor-template-library-template-delete',
			renameButton: '.elementor-template-library-template-rename',
			moveButton: '.elementor-template-library-template-move',
			morePopup: '.elementor-template-library-template-more',
			toggleMore: '.elementor-template-library-template-more-toggle',
			toggleMoreIcon: '.elementor-template-library-template-more-toggle i',
			titleCell: '.elementor-template-library-template-name span',
			resourceIcon: '.elementor-template-library-template-name i',
			previewImg: '.elementor-template-library-template-thumbnail img',
		} );
	},

	events() {
		return _.extend( TemplateLibraryTemplateView.prototype.events.apply( this, arguments ), {
			'click @ui.deleteButton': 'onDeleteButtonClick',
			'click @ui.toggleMore': 'onToggleMoreClick',
			'click @ui.renameButton': 'onRenameClick',
			'click @ui.moveButton': 'onMoveClick',
		} );
	},

	modelEvents: {
		'change:title': 'onTitleChange',
		'change:preview_url': 'onPreviewUrlChange',
	},

	onRender() {
		const view = elementor.templates.getViewSelection();

		if ( 'FOLDER' !== this.model.get( 'subType' ) &&
			this.model.get( 'generate_preview_url' ) &&
			! this.model.get( 'preview_url' ) &&
			'grid' === view
		) {
			this.createScreenshotIframe();
		}
	},

	onTitleChange() {
		const title = _.escape( this.model.get( 'title' ) );

		this.ui.titleCell.text( title );
	},

	onPreviewUrlChange() {
		const isCloudSource = 'cloud' === this.model.get( 'source' );

		if ( isCloudSource && this.model.get( 'preview_url' ) ) {
			this.ui.previewImg.attr( 'src', this.model.get( 'preview_url' ) );
			this.ui.previewImg.css( 'object-fit', 'contain' );
			this.model.set( 'generate_preview_url', null );
			this.iframe.remove();
		}
	},

	onDeleteButtonClick() {
		var toggleMoreIcon = this.ui.toggleMoreIcon;

		elementor.templates.deleteTemplate( this.model, {
			onConfirm() {
				toggleMoreIcon.removeClass( 'eicon-ellipsis-h' ).addClass( 'eicon-loading eicon-animation-spin' );
			},
			onSuccess() {
				$e.routes.refreshContainer( 'library' );
			},
		} );
	},

	createScreenshotIframe( ) {
		const iframe = document.createElement( 'iframe' );

		iframe.src = this.model.get( 'generate_preview_url' );
		iframe.width = '1200';
		iframe.height = '500';
		iframe.style = 'visibility: hidden;';

		document.body.appendChild( iframe );

		this.iframe = iframe;
	},

	onToggleMoreClick( event ) {
		event.stopPropagation();

		this.ui.morePopup.show();
	},

	onPreviewButtonClick() {
		open( this.model.get( 'url' ), '_blank' );
	},

	async onRenameClick( event ) {
		event.stopPropagation();

		try {
			await elementor.templates.renameTemplate( this.model, {
				onConfirm: () => this.showToggleMoreLoader(),
			} );
		} finally {
			this.hideToggleMoreLoader();
		}
	},

	onMoveClick() {
		$e.route( 'library/save-template', {
			model: this.model,
			context: SAVE_CONTEXTS.MOVE,
		} );
	},

	showToggleMoreLoader() {
		this.ui.toggleMoreIcon.removeClass( 'eicon-ellipsis-h' ).addClass( 'eicon-loading eicon-animation-spin' );
	},

	hideToggleMoreLoader() {
		this.ui.toggleMoreIcon.addClass( 'eicon-ellipsis-h' ).removeClass( 'eicon-loading eicon-animation-spin' );
	},
} );

module.exports = TemplateLibraryTemplateLocalView;
