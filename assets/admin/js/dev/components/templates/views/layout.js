var TemplatesHeaderView = require( 'elementor-templates/views/parts/header' ),
	TemplatesLoadingView = require( 'elementor-templates/views/parts/loading' ),
	TemplatesCollectionView = require( 'elementor-templates/views/parts/templates' ),
	TemplatesSaveTemplateView = require( 'elementor-templates/views/parts/save-template' ),
	TemplatesImportView = require( 'elementor-templates/views/parts/import' ),
	TemplatesPreviewView = require( 'elementor-templates/views/parts/preview' ),
	TemplatesLayoutView;

TemplatesLayoutView = Marionette.LayoutView.extend( {
	el: '#elementor-templates-modal',

	regions: {
		modalContent: '.dialog-message',
		modalHeader: '.dialog-widget-header'
	},

	initialize: function() {
		this.getRegion( 'modalHeader' ).show( new TemplatesHeaderView() );
	},

	showLoadingView: function() {
		this.getRegion( 'modalContent' ).show( new TemplatesLoadingView() );
	},

	showTemplatesView: function( templatesCollection ) {
		this.getRegion( 'modalContent' ).show( new TemplatesCollectionView( {
			collection: templatesCollection
		} ) );
	},

	showImportView: function() {
		this.getRegion( 'modalContent' ).show( new TemplatesImportView() );
	},

	showSaveTemplateView: function() {
		this.getRegion( 'modalContent' ).show( new TemplatesSaveTemplateView() );
	},

	showPreviewView: function( previewUrl ) {
		this.getRegion( 'modalContent' ).show( new TemplatesPreviewView( {
			url: previewUrl
		} ) );
	}
} );

module.exports = TemplatesLayoutView;
