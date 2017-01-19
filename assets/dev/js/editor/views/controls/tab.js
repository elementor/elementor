var ControlBaseItemView = elementor.modules.controls.Base,
	ControlTabItemView;

ControlTabItemView = ControlBaseItemView.extend( {
	triggers: {
		'click': 'control:tab:clicked'
	}
} );

module.exports = ControlTabItemView;
