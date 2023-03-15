var ControlBaseView = require( 'elementor-controls/base' ),
	ControlSectionItemView;

ControlSectionItemView = ControlBaseView.extend( {
	ui() {
		var ui = ControlBaseView.prototype.ui.apply( this, arguments );

		ui.heading = '.elementor-panel-heading';

		return ui;
	},

	triggers: {
		click: 'control:section:clicked',
	},
} );

module.exports = ControlSectionItemView;
