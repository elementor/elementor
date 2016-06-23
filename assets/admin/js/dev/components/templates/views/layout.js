var TemplatesHeaderView = require( 'elementor-templates/views/parts/header' ),
	TemplatesLoadingView = require( 'elementor-templates/views/parts/loading' ),
	TemplatesCollectionView = require( 'elementor-templates/views/parts/templates' ),
	TemplatesLayoutView;

TemplatesLayoutView = Marionette.LayoutView.extend( {
	el: '#elementor-templates-modal',

	regions: {
		modalContent: '.dialog-message',
		modalHeader: '.dialog-widget-header'
	},

	onShow: function() {
		this.getRegion( 'modalHeader' ).show( new TemplatesHeaderView() );
	},

	showLoading: function() {
		this.getRegion( 'modalContent' ).show( new TemplatesLoadingView() );
	},

	showTemplates: function( templates ) {
		this.getRegion( 'modalContent' ).show( new TemplatesCollectionView( {
			templates: templates
		} ) );
	}
} );

module.exports = TemplatesLayoutView;
