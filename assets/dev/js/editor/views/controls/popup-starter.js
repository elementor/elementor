var ControlBaseView = require( 'elementor-views/controls/base' ),
	ControlPopupStarterView;

ControlPopupStarterView = ControlBaseView.extend( {
	ui: function() {
		var ui = ControlBaseView.prototype.ui.apply( this, arguments );

		ui.popupToggle = '.elementor-control-popup-starter-toggle';

		return ui;
	},

	events: {
		'click @ui.popupToggle': 'onPopupToggleClick'
	},

	onPopupToggleClick: function() {
		this.$el.next( '.elementor-controls-popup' ).toggle();
	}
} );

module.exports = ControlPopupStarterView;
