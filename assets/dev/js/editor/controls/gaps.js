// eslint-disable-next-line prefer-const
let ControlDimensionsView = require( 'elementor-controls/dimensions' ),
	ControlGapItemView;

// eslint-disable-next-line prefer-const
ControlGapItemView = ControlDimensionsView.extend( {

	ui() {
		// eslint-disable-next-line prefer-const
		const ui = ControlDimensionsView.prototype.ui.apply( this, arguments );

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
