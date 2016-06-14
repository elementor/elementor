var ControlMultipleBaseItemView = require( 'elementor-views/controls/base-multiple' ),
	ControlImageDimensionsItemView;

ControlImageDimensionsItemView = ControlMultipleBaseItemView.extend( {
	ui: function() {
		var ui = ControlMultipleBaseItemView.prototype.ui.apply( this, arguments );

		ui.btnApply = 'button.elementor-image-dimensions-apply-button';

		return ui;
	},

	// Override the base events
	childEvents: {
		'click @ui.btnApply': 'onApplyClicked'
	},

	onApplyClicked: function( event ) {
		event.preventDefault();
	}
} );

module.exports = ControlImageDimensionsItemView;
