/**
 * Script to get the widget-config.json:
 * Object.fromEntries( Object.entries( elementor.widgetsCache ).map(([key, value]) => [key, {controls: value.controls}] ) )
 */

export default {
	elements: {
		include: [ 'heading', 'text-editor', 'divider', 'button', 'image' ],
	},
	controls: {
		heading: {
			dependencies: {
				blend_mode: {
					_background_background: 'classic',
					_background_color: [ 'local', '#FF0000' ],
				},
			},
			exclude: [
				// Cannot be tested alone: setting stroke color without setting stroke width,
				// + have some issues with color picker inside the popover.
				'text_stroke_stroke_color',
			],
		},
		'text-editor': {
			dependencies: {
				column_gap: {
					text_columns: '4',
				},
			},
		},
		divider: {
			dependencies: {
				align: {
					width: [ '%', '30' ],
				},
			},
		},
		button: {
			exclude: [
				'button_css_id',
				'button_type', // Bug in the editor nothing changed.
			],
		},
		image: {
			dependencies: {
				'*': {
					image: 'elementor.png',
				},
			},
			exclude: [
				'image',
				'link_to',
				'height',
				'image_size', // Nothing visual.
			],
		},
	} };
