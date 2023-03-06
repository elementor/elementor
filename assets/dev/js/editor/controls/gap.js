var ControlDimensionsView = require( 'elementor-controls/dimensions' ),
	ControlGapItemView;

ControlGapItemView = ControlDimensionsView.extend( {

	ui() {
		var ui = ControlDimensionsView.prototype.ui.apply(this, arguments);

		ui.controls = '.elementor-control-gap > input:enabled';
		ui.link = 'button.elementor-link-gaps';

		return ui;
	},

	getPossibleDimensions() {
		return [
			'row',
			'column',
		];
	},
} );
module.exports = ControlGapItemView;
