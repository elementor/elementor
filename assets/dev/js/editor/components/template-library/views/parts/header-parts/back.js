module.exports = Marionette.ItemView.extend( {
	template: '#tmpl-elementor-template-library-header-back',

	id: 'elementor-template-library-header-preview-back',

	events: {
		'click': 'onClick'
	},

	onClick: function() {
		elementor.templates.showTemplates();
	}
} );
