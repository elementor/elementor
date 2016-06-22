var ElementorTemplatesHeaderView = require( 'elementor-templates/views/parts/header' ),
	ElementorTemplatesCollectionView = require( 'elementor-templates/views/parts/templates' ),
	ElementorTemplatesLayoutView;

ElementorTemplatesLayoutView = Marionette.LayoutView.extend( {
	el: '#elementor-templates-modal',

	regions: {
		modalContent: '.dialog-message',
		modalHeader: '.dialog-widget-header'
	},

	onShow: function() {
		this.getRegion( 'modalHeader' ).show( new ElementorTemplatesHeaderView() );
	},

	showTemplates: function( templates ) {
		this.getRegion( 'modalContent' ).show( new ElementorTemplatesCollectionView( {
			templates: templates
		} ) );
	}
} );

module.exports = ElementorTemplatesLayoutView;
