var TemplateLibraryHeaderView = require( 'elementor-templates/views/parts/header' ),
	TemplateLibraryHeaderLogoView = require( 'elementor-templates/views/parts/header-parts/logo' ),
	TemplateLibraryHeaderActionsView = require( 'elementor-templates/views/parts/header-parts/actions' ),
	TemplateLibraryHeaderMenuView = require( 'elementor-templates/views/parts/header-parts/menu' ),
	TemplateLibraryHeaderPreviewView = require( 'elementor-templates/views/parts/header-parts/preview' ),
	TemplateLibraryHeaderBackView = require( 'elementor-templates/views/parts/header-parts/back' ),
	TemplateLibraryLoadingView = require( 'elementor-templates/views/parts/loading' ),
	TemplateLibraryCollectionView = require( 'elementor-templates/views/parts/templates' ),
	TemplateLibrarySaveTemplateView = require( 'elementor-templates/views/parts/save-template' ),
	TemplateLibraryImportView = require( 'elementor-templates/views/parts/import' ),
	TemplateLibraryPreviewView = require( 'elementor-templates/views/parts/preview' ),
	TemplateLibraryLayoutView;

TemplateLibraryLayoutView = Marionette.LayoutView.extend( {
	el: '#elementor-template-library-modal',

	regions: {
		modalHeader: '.dialog-widget-header',
		modalContent: '.dialog-lightbox-content',
		modalPreview: '.dialog-lightbox-preview'
	},

	initialize: function() {
		this.modalHeader.show( new TemplateLibraryHeaderView() );
	},

	getHeaderView: function() {
		return this.modalHeader.currentView;
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
		headerView.logoArea.show( new TemplateLibraryHeaderLogoView() );
	},

	showLoadingView: function() {
		this.modalContent.show( new TemplateLibraryLoadingView() );
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

module.exports = TemplateLibraryLayoutView;
