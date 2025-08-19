import LocalizedValueStore from 'elementor-editor-utils/localized-value-store';

const PanelElementsSearchView = Marionette.ItemView.extend( {
	template: '#tmpl-elementor-panel-element-search',

	localizedValue: '',
	localizedValueStore: new LocalizedValueStore(),

	tagName: 'search',

	id: 'elementor-panel-elements-search-wrapper',

	ui: {
		input: 'input',
	},

	events: {
		'keydown @ui.input': 'onInputChanged', // Used to capture the ctrl+V
		'input @ui.input': 'onInputChanged', // Will capture the context menu paste
	},

	clearInput() {
		this.ui.input.val( '' );
	},

	onInputChanged( event ) {
		const ESC_KEY = 27;
		if ( ESC_KEY === event.keyCode ) {
			this.clearInput();
		}
		this.localizedValue = this.localizedValueStore.appendAndParseLocalizedData( event );
		// Broadcast the localized value.
		elementor.channels.panelElements.reply( 'filter:localized', this.localizedValue );
		this.triggerMethod( 'search:change:input' );
	},
} );

module.exports = PanelElementsSearchView;
