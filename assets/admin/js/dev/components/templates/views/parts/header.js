var TemplatesHeaderView;

TemplatesHeaderView = Marionette.ItemView.extend( {
	id: 'elementor-templates-header',

	template: '#tmpl-elementor-templates-header',

	ui: {
		searchInput: '#elementor-templates-header-search-area input'
	},

	events: {
		'input @ui.searchInput': 'onSearchInputChange'
	},

	onSearchInputChange: function() {
		elementor.channels.templates
		         .reply( 'filter:text', this.ui.searchInput.val() )
		         .trigger( 'filter:change' );
	}
} );

module.exports = TemplatesHeaderView;
