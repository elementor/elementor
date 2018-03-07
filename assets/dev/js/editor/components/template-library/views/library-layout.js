var BaseModalLayout = require( 'elementor-templates/views/base-modal-layout' ),
	TemplateLibraryHeaderActionsView = require( 'elementor-templates/views/parts/header-parts/actions' ),
	TemplateLibraryHeaderMenuView = require( 'elementor-templates/views/parts/header-parts/menu' ),
	TemplateLibraryHeaderPreviewView = require( 'elementor-templates/views/parts/header-parts/preview' ),
	TemplateLibraryHeaderBackView = require( 'elementor-templates/views/parts/header-parts/back' ),
	TemplateLibraryCollectionView = require( 'elementor-templates/views/parts/templates' ),
	TemplateLibrarySaveTemplateView = require( 'elementor-templates/views/parts/save-template' ),
	TemplateLibraryImportView = require( 'elementor-templates/views/parts/import' ),
	TemplateLibraryPreviewView = require( 'elementor-templates/views/parts/preview' );

module.exports = BaseModalLayout.extend( {

	regions: function() {
		var regions = BaseModalLayout.prototype.regions.apply( this, arguments );

		regions.modalPreview = '.dialog-lightbox-preview';

		return regions;
	},

	getModalOptions: function() {
		return {
			id: 'elementor-template-library-modal'
		};
	},

	getLogoOptions: function() {
		return {
			title: elementor.translate( 'library' ),
			click: function() {
				elementor.templates.setTemplatesPage( 'remote', 'page' );
			}
		};
	},

	initModal: function() {
		BaseModalLayout.prototype.initModal.apply( this, arguments );

		this.modal.getElements( 'message' ).append( this.modal.addElement( 'preview' ) );
	},

	getTemplateActionButton: function( templateData ) {
		var viewId = '#tmpl-elementor-template-library-' + ( templateData.isPro ? 'get-pro-button' : 'insert-button' );

		viewId = elementor.hooks.applyFilters( 'elementor/editor/template-library/template/action-button', viewId, templateData );

		var template = Marionette.TemplateCache.get( viewId );

		return Marionette.Renderer.render( template );
	},

	setHeaderDefaultParts: function() {
		var headerView = this.getHeaderView();

		headerView.tools.show( new TemplateLibraryHeaderActionsView() );
		headerView.menuArea.show( new TemplateLibraryHeaderMenuView() );

		this.showLogo();
	},

	showTemplatesView: function( templatesCollection ) {
		this.modalContent.show( new TemplateLibraryCollectionView( {
			collection: templatesCollection
		} ) );

		this.setHeaderDefaultParts();
	},

	showImportView: function() {
		this.getHeaderView().menuArea.reset();

		this.modalContent.show( new TemplateLibraryImportView() );
	},

	showSaveTemplateView: function( elementModel ) {
		this.getHeaderView().menuArea.reset();

		this.modalContent.show( new TemplateLibrarySaveTemplateView( { model: elementModel } ) );
	},

	openPreview: function( templateModel ) {
		this.modalPreview.show( new TemplateLibraryPreviewView( {
			url: templateModel.get( 'url' )
		} ) );

		var headerView = this.getHeaderView();

		headerView.menuArea.reset();

		headerView.tools.show( new TemplateLibraryHeaderPreviewView( {
			model: templateModel
		} ) );

		headerView.logoArea.show( new TemplateLibraryHeaderBackView() );

		this.modalContent.$el.hide();

		this.modalPreview.$el.show();
	},

	closePreview: function() {
		this.setHeaderDefaultParts();

		this.modalContent.$el.show();

		this.modalPreview.$el.hide();
	}
} );
