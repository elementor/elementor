var PanelElementsSearchView;

PanelElementsSearchView = Marionette.ItemView.extend( {
	template: '#tmpl-elementor-panel-element-search',

	id: 'elementor-panel-elements-search-wrapper',

	ui: {
		input: 'input',
	},

	events: {
		'input @ui.input': 'onInputChanged',
	},

	clearInput: function() {
		this.ui.input.val( '' );
	},

	onInputChanged: function( event ) {
		var ESC_KEY = 27;

		if ( ESC_KEY === event.keyCode ) {
			this.clearInput();
		}

		this.toggleMagnifierIcon();

		this.triggerMethod( 'search:change:input' );
	},

	toggleMagnifierIcon: function() {
		if ( '' !== this.ui.input[0].value ) {
			$( '#elementor-panel-elements-search-wrapper i.eicon-search' ).hide();
		} else {
			$( '#elementor-panel-elements-search-wrapper i.eicon-search' ).show();
		}
	},
} );

module.exports = PanelElementsSearchView;
