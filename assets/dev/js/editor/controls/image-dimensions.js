import Scrubbing from './behaviors/scrubbing';

var ControlMultipleBaseItemView = require( 'elementor-controls/base-multiple' ),
	ControlImageDimensionsItemView;

ControlImageDimensionsItemView = ControlMultipleBaseItemView.extend( {

	behaviors() {
		return {
			...ControlMultipleBaseItemView.prototype.behaviors.apply( this ),
			Scrubbing: {
				behaviorClass: Scrubbing,
				scrubSettings: { intentTime: 800 },
			},
		};
	},

	ui() {
		return {
			inputWidth: 'input[data-setting="width"]',
			inputHeight: 'input[data-setting="height"]',

			btnApply: 'button.elementor-image-dimensions-apply-button',
		};
	},

	// Override the base events
	events() {
		return {
			'click @ui.btnApply': 'onApplyClicked',
			'keyup @ui.inputWidth': 'onDimensionKeyUp',
			'keyup @ui.inputHeight': 'onDimensionKeyUp',
		};
	},

	onDimensionKeyUp( event ) {
		const ENTER_KEY = 13;

		if ( ENTER_KEY === event.keyCode ) {
			this.onApplyClicked( event );
		}
	},

	onApplyClicked( event ) {
		event.preventDefault();

		this.setValue( {
			width: this.ui.inputWidth.val(),
			height: this.ui.inputHeight.val(),
		} );
	},
} );

module.exports = ControlImageDimensionsItemView;
