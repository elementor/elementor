import LocalizedValueStore from 'elementor-editor-utils/localized-value-store';
import InputUtils from 'elementor-editor-utils/input';

const PanelElementsSearchView = Marionette.ItemView.extend( {
	template: '#tmpl-elementor-panel-element-search',

	localizedValue: '',
	localizedValueStore: new LocalizedValueStore(),

	id: 'elementor-panel-elements-search-wrapper',

	ui: {
		input: 'input',
	},

	events: {
		'keyDown @ui.input': 'onInputChanged',
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
		if ( InputUtils.isPaste( event ) ) {
			this.localizedValue = event.target.value;
		} else {
			this.localizedValue = this.localizedValueStore.getLocalizedValue();
		}
		// Broadcast the localized value.
		elementor.channels.panelElements.reply( 'filter:localized', this.localizedValue );
		this.triggerMethod( 'search:change:input' );
	},
} );

module.exports = PanelElementsSearchView;
