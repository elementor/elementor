module.exports = Marionette.Region.extend( {
	el: '#elementor-panel',

	constructor: function() {
		Marionette.Region.prototype.constructor.apply( this, arguments );

		var PanelLayoutView = require( 'elementor-layouts/panel/layout' );

		this.show( new PanelLayoutView() );

		this.resizable();
	},

	resizable: function() {
		var side = elementor.config.is_rtl ? 'right' : 'left';

		this.$el.resizable( {
			handles: elementor.config.is_rtl ? 'w' : 'e',
			minWidth: 200,
			maxWidth: 680,
			start: function() {
				elementor.$previewWrapper.addClass( 'ui-resizable-resizing' );
			},
			stop: function() {
				elementor.$previewWrapper.removeClass( 'ui-resizable-resizing' );

				elementor.getPanelView().updateScrollbar();
			},
			resize: function( event, ui ) {
				elementor.$previewWrapper.css( side, ui.size.width );
			}
		} );
	}
} );
