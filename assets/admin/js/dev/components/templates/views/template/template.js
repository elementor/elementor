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
			data: {
				action: 'elementor_get_template',
				type: this.model.get( 'type' ),
				item_id: this.model.get( 'id' )
			},
			success: function( response ) {
				if ( ! response.success ) {
					elementor.templates.showErrorDialog( response.data.message );

					return;
				}

				elementor.templates.getModal().hide();

				elementor.getRegion( 'sections' ).currentView.addChildModel( response.data.template );
			}
		} );
	}
} );

module.exports = TemplatesTemplateView;
