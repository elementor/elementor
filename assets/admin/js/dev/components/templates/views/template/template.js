var TemplatesTemplateView;

TemplatesTemplateView = Marionette.ItemView.extend( {
	className: 'elementor-templates-template',

	template: '#tmpl-elementor-templates-template',

	ui: {
		item: '.elementor-templates-template-screenshot-wrapper'
	},

	events: {
		'click @ui.item': 'onItemClicked'
	},

	onItemClicked: function() {
		Backbone.$.ajax( {
			type: 'POST',
			url: elementor.config.ajaxurl,
		elementor.ajax.send( 'get_template', {
			data: {
				type: this.model.get( 'type' ),
				item_id: this.model.get( 'id' )
			},
			success: function( data ) {
				elementor.templates.getModal().hide();

				elementor.getRegion( 'sections' ).currentView.addChildModel( data.template );
			},
			error: function( data ) {
				elementor.templates.showErrorDialog( data.message );
			}
		} );
	}
} );

module.exports = TemplatesTemplateView;
