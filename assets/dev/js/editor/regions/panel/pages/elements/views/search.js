import LocalizedValueStore from 'elementor-editor-utils/localized-value-store';
import UserEvents from 'elementor-editor-utils/user-events';

const PanelElementsSearchView = Marionette.ItemView.extend( {
	template: '#tmpl-elementor-panel-element-search',

	localizedValue: '',
	localizedValueStore: new LocalizedValueStore(),

	id: 'elementor-panel-elements-search-wrapper',

	ui: {
		input: 'input',
	},

	events: {
		'keydown @ui.input': 'onInputChanged',
		'input @ui.input': 'onInputChanged',
	},

	clearInput: function() {
		this.ui.input.val( '' );
	},

	onInputChanged: function( event ) {
		const ESC_KEY = 27;
		if ( ESC_KEY === event.keyCode ) {
			this.clearInput();
		}

		this.localizedValueStore.sendKey( event );
		this.localizedValue = UserEvents.isPaste( event ) ?
			event.target.value :
			this.localizedValueStore.get();
		// Broadcast the localized value.
		elementor.channels.panelElements.reply( 'filter:localized', this.localizedValue );
		this.triggerMethod( 'search:change:input' );
	},
} );

module.exports = PanelElementsSearchView;
