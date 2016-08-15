var TemplateLibraryHeaderLogoView;

TemplateLibraryHeaderLogoView = Marionette.ItemView.extend( {
	template: '#tmpl-elementor-template-library-header-logo',

	id: 'elementor-template-library-header-logo',

	events: {
		'click': 'onClick'
	},

	onClick: function() {
		elementor.templates.setTemplatesSource( 'remote' );
		elementor.templates.showTemplates();
	}
} );

module.exports = TemplateLibraryHeaderLogoView;
