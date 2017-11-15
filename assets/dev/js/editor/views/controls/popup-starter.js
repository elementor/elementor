var ControlChooseView = require( 'elementor-views/controls/choose' ),
	ControlPopupStarterView;

ControlPopupStarterView = ControlChooseView.extend( {
	ui: function() {
		var ui = ControlChooseView.prototype.ui.apply( this, arguments );

		ui.popupToggle = 'label.elementor-control-popup-starter-toggle';

		return ui;
	},

	events: function() {
		return _.extend( ControlChooseView.prototype.events.apply( this, arguments ), {
			'click @ui.popupToggle': 'onPopupToggleClick'
		} );
	},

	onPopupToggleClick: function() {
		this.$el.next( '.elementor-controls-popup' ).toggle();
	}
} );

module.exports = ControlPopupStarterView;
