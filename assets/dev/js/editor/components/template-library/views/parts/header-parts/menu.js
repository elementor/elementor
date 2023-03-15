module.exports = Marionette.ItemView.extend( {
	template: '#tmpl-elementor-template-library-header-menu',

	id: 'elementor-template-library-header-menu',

	templateHelpers() {
		return {
			tabs: $e.components.get( 'library' ).getTabs(),
		};
	},
} );
