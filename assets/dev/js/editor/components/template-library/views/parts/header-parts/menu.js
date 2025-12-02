module.exports = Marionette.ItemView.extend( {
	template: '#tmpl-elementor-template-library-header-menu',

	id: 'elementor-template-library-header-menu',

	templateHelpers() {
		return {
			tabs: $e.components.get( 'library' ).getTabs(),
		};
	},

	attributes() {
		return {
			role: 'tablist',
			'aria-label': __( 'Library sections', 'elementor' ),
		};
	},
} );
