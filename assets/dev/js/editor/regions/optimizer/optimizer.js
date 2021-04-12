import View from './view';

export default class extends Marionette.Region {
	initialize() {
		this.show( new View() );
/*
		elementor.panel.$el.on( {
			resizestart: () => this.onPanelResizeStart(),
			resizestop: () => this.onPanelResizeStop(),

		} );
*/
	}

/*	onPanelResizeStart() {
		this.$el.addClass( 'ui-resizable-resizing' );
	}

	onPanelResizeStop() {
		this.$el.removeClass( 'ui-resizable-resizing' );
	}*/
}

/*
export default class extends elementorModules.ViewModule {
	getDefaultSettings() {
		return {
			selectors: {
				iframe: '#elementor-optimizer',
			},
		};
	}

	getDefaultElements() {
		const settings = this.getSettings();

		return {
			$iframe: jQuery( settings.selectors.iframe ),
		};
	}

	bindEvents() {
		this.elements.$iframe.on( 'load', this.onOptimizerLoaded.bind( this ) );
	}

	onOptimizerLoaded() {
		console.log( 'Optimizer loaded' );

		// elementorCommon.ajax.addRequest( 'notice_bar_dismiss' );
	}
}
*/
