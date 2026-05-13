module.exports = Marionette.ItemView.extend( {
	template: '#tmpl-elementor-template-library-header-back',

	id: 'elementor-template-library-header-preview-back',

	events: {
		'click .elementor-template-library-header-back-button': 'onClick',
	},

	onClick() {
		$e.routes.restoreState( 'library' );
	},
} );
