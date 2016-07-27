var TemplatesHeaderView = require( 'elementor-templates/views/parts/header' ),
	TemplatesHeaderLogoView = require( 'elementor-templates/views/parts/header-parts/logo' ),
	TemplatesHeaderSettingsView = require( 'elementor-templates/views/parts/header-parts/settings' ),
	TemplatesHeaderMenuView = require( 'elementor-templates/views/parts/header-parts/menu' ),
	TemplatesHeaderPreviewView = require( 'elementor-templates/views/parts/header-parts/preview' ),
	TemplatesHeaderBackView = require( 'elementor-templates/views/parts/header-parts/back' ),
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

	getHeaderView: function() {
		return this.getRegion( 'modalHeader' ).currentView;
	},

	showLoadingView: function() {
		this.getRegion( 'modalContent' ).show( new TemplatesLoadingView() );
	},

	showTemplatesView: function( templatesCollection ) {
		this.getRegion( 'modalContent' ).show( new TemplatesCollectionView( {
			collection: templatesCollection
		} ) );

		var headerView = this.getHeaderView();

		headerView.tools.show( new TemplatesHeaderSettingsView() );

		headerView.menuArea.show( new TemplatesHeaderMenuView() );

		headerView.logoArea.show( new TemplatesHeaderLogoView() );
	},

	showImportView: function() {
		this.getRegion( 'modalContent' ).show( new TemplatesImportView() );
	},

	showSaveTemplateView: function() {
		this.getRegion( 'modalContent' ).show( new TemplatesSaveTemplateView() );

		this.getHeaderView().logoArea.show( new TemplatesHeaderLogoView() );
	},

	showPreviewView: function( templateModel ) {
		this.getRegion( 'modalContent' ).show( new TemplatesPreviewView( {
			url: templateModel.get( 'url' )
		} ) );

		var headerView = this.getHeaderView();

		headerView.tools.show( new TemplatesHeaderPreviewView( {
			model: templateModel
		} ) );

		headerView.logoArea.show( new TemplatesHeaderBackView() );
	}
} );

module.exports = TemplatesLayoutView;
