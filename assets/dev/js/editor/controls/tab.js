var ControlBaseView = require( 'elementor-controls/base' ),
	ControlTabItemView;

ControlTabItemView = ControlBaseView.extend( {
	triggers: {
		click: {
			event: 'control:tab:clicked',
			stopPropagation: false,
		},
	},
} );

module.exports = ControlTabItemView;
