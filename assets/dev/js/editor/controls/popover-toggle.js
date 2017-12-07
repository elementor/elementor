var ControlChooseView = require( 'elementor-controls/choose' ),
	ControlPopoverStarterView;

ControlPopoverStarterView = ControlChooseView.extend( {
	ui: function() {
		var ui = ControlChooseView.prototype.ui.apply( this, arguments );

		ui.popoverToggle = '.elementor-control-popover-toggle-toggle';

		return ui;
	},

	events: function() {
		return _.extend( ControlChooseView.prototype.events.apply( this, arguments ), {
			'click @ui.popoverToggle': 'onPopoverToggleClick'
		} );
	},

	onPopoverToggleClick: function() {
		this.$el.next( '.elementor-controls-popover' ).toggle();
	}
} );

module.exports = ControlPopoverStarterView;
