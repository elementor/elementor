var ControlBaseItemView = require( 'elementor-views/controls/base' ),
	ControlAnimationItemView;

ControlAnimationItemView = ControlBaseItemView.extend( {

	onReady: function() {
		this.ui.select.select2();
	}
} );

module.exports = ControlAnimationItemView;
