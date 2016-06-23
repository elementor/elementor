var TemplatesHeaderView = require( 'elementor-templates/views/parts/header' ),
	TemplatesLoadingView = require( 'elementor-templates/views/parts/loading' ),
	TemplatesCollectionView = require( 'elementor-templates/views/parts/templates' ),
	TemplatesSaveTemplateView = require( 'elementor-templates/views/parts/save-template' ),
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

	showSaveTemplateView: function() {
		this.getRegion( 'modalContent' ).show( new TemplatesSaveTemplateView() );
	}
} );

module.exports = TemplatesLayoutView;
