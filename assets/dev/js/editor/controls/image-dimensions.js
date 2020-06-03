var ControlMultipleBaseItemView = require( 'elementor-controls/base-multiple' ),
	ControlImageDimensionsItemView;

ControlImageDimensionsItemView = ControlMultipleBaseItemView.extend( {
	ui: function() {
		return {
			inputWidth: 'input[data-setting="width"]',
			inputHeight: 'input[data-setting="height"]',

			btnApply: 'button.elementor-image-dimensions-apply-button',
		};
	},

	// Override the base events
	events: function() {
		return {
			'click @ui.btnApply': 'onApplyClicked',
			'keyup @ui.inputWidth': 'onDimensionKeyUp',
			'keyup @ui.inputHeight': 'onDimensionKeyUp',
		};
	},

	onDimensionKeyUp: function( event ) {
		const ENTER_KEY = 13;

		if ( ENTER_KEY === event.keyCode ) {
			this.onApplyClicked( event );
		}
	},

	onApplyClicked: function( event ) {
		event.preventDefault();

		this.setValue( {
			width: this.ui.inputWidth.val(),
			height: this.ui.inputHeight.val(),
		} );
	},
} );

module.exports = ControlImageDimensionsItemView;
