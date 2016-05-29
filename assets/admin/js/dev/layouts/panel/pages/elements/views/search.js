var PanelElementsSearchView;

PanelElementsSearchView = Marionette.ItemView.extend( {
	template: '#tmpl-elementor-panel-element-search',

	id: 'elementor-panel-elements-search-wrapper',

	ui: {
		input: 'input'
	},

	triggers: {
		'keyup @ui.input': 'search:change:input'
	},

	onClearFilter: function() {
		this.ui.input.val( '' );
	}
} );

module.exports = PanelElementsSearchView;
