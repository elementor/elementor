var TemplatesHeaderView = require( 'elementor-templates/views/parts/header' ),
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

	showTemplates: function( templates ) {
		this.getRegion( 'modalContent' ).show( new TemplatesCollectionView( {
			templates: templates
		} ) );
	}
} );

module.exports = TemplatesLayoutView;
