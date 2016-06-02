var PanelElementsSearchView;

PanelElementsSearchView = Marionette.ItemView.extend( {
	template: '#tmpl-elementor-panel-element-search',

	id: 'elementor-panel-elements-search-wrapper',

	ui: {
		input: 'input'
	},

	events: {
		'keyup @ui.input': 'onInputChanged'
	},

	onInputChanged: function( event ) {
		if ( 27 === event.keyCode ) {
			this.clearInput();
		}

		this.triggerMethod( 'search:change:input' );
	},

	clearInput: function() {
		this.ui.input.val( '' );
	}
} );

module.exports = PanelElementsSearchView;
