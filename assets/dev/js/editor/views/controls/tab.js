var ControlBaseView = require( 'elementor-views/controls/base' ),
	ControlTabItemView;

ControlTabItemView = ControlBaseView.extend( {
	triggers: {
		'click': 'control:tab:clicked'
	}
} );

module.exports = ControlTabItemView;
