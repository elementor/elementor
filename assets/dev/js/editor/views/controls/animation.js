var ControlBaseItemView = elementor.modules.controls.Base,
	ControlAnimationItemView;

ControlAnimationItemView = ControlBaseItemView.extend( {

	onReady: function() {
		this.ui.select.select2();
	}
} );

module.exports = ControlAnimationItemView;
