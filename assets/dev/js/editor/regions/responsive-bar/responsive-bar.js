import View from './view';

export default class extends Marionette.Region {
	initialize() {
		this.show( new View() );

		elementor.panel.$el.on( {
			resizestart: () => this.onPanelResizeStart(),
			resizestop: () => this.onPanelResizeStop(),
		} );
	}

	onPanelResizeStart() {
		this.$el.addClass( 'ui-resizable-resizing' );
	}

	onPanelResizeStop() {
		this.$el.removeClass( 'ui-resizable-resizing' );
	}
}
