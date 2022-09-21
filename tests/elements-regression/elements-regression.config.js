/**
 * Script to get the widget-config.json:
 * Object.fromEntries( Object.entries( elementor.widgetsCache ).map(([key, value]) => [key, {controls: value.controls}] ) )
 */

module.exports = {
	elements: {
		include: [ 'heading', 'text-editor', 'divider', 'button',  'image' ],
	},
	controls: {
		heading: {
			exclude: [
				'text_stroke_stroke_color', // Cannot be tested alone: setting stroke color without setting stroke width.
			],
		},
		'text-editor': {
			exclude: [
				'column_gap', // Cannot be tested alone: must be along side with `column` control.
			],
		},
		divider: {
			exclude: [
				'align', // Cannot be tested alone, need also some size.
			],
		},
		button: {
			exclude: [
				'button_css_id', // Nothing changed
				'button_type', // Bug in the editor nothing changed.
			],
		},
		image: {},
	},
};
