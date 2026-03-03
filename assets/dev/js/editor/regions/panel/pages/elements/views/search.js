import LocalizedValueStore from 'elementor-editor-utils/localized-value-store';
import { createDebouncedWidgetPanelSearch } from 'elementor-editor-utils/editor-one-events';

const WIDGET_PANEL_SEARCH_DEBOUNCE_MS = 2000;

const PanelElementsSearchView = Marionette.ItemView.extend( {
	template: '#tmpl-elementor-panel-element-search',

	localizedValue: '',
	localizedValueStore: new LocalizedValueStore(),
	debouncedTrackSearch: null,

	tagName: 'search',

	id: 'elementor-panel-elements-search-wrapper',

	ui: {
		input: 'input',
	},

	events: {
		'keydown @ui.input': 'onInputChanged', // Used to capture the ctrl+V
		'input @ui.input': 'onInputChanged', // Will capture the context menu paste
	},

	initialize() {
		this.debouncedTrackSearch = createDebouncedWidgetPanelSearch( WIDGET_PANEL_SEARCH_DEBOUNCE_MS );
	},

	clearInput() {
		this.ui.input.val( '' );
	},

	getVisibleWidgetsCount() {
		const $widgetsContainer = jQuery( '#elementor-panel-elements' );
		return $widgetsContainer.find( '.elementor-element:visible' ).length;
	},

	trackWidgetSearch() {
		const userInput = this.ui.input.val();
		if ( ! userInput ) {
			return;
		}

		setTimeout( () => {
			const resultsCount = this.getVisibleWidgetsCount();
			this.debouncedTrackSearch( resultsCount, userInput );
		}, 100 );
	},

	onInputChanged( event ) {
		const ESC_KEY = 27;
		if ( ESC_KEY === event.keyCode ) {
			this.clearInput();
		}
		this.localizedValue = this.localizedValueStore.appendAndParseLocalizedData( event );
		elementor.channels.panelElements.reply( 'filter:localized', this.localizedValue );
		this.triggerMethod( 'search:change:input' );

		this.trackWidgetSearch();
	},

	onDestroy() {
		if ( this.debouncedTrackSearch?.cancel ) {
			this.debouncedTrackSearch.cancel();
		}
	},
} );

module.exports = PanelElementsSearchView;
