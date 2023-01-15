/**
 * Script to get the widget-config.json:
 * Object.fromEntries( Object.entries( elementor.widgetsCache ).map(([key, value]) => [key, {controls: value.controls}] ) )
 */

module.exports = {
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
			frontend_exclude: {
				text_stroke_text_stroke: [
					'em-0.5',
					'em-1',
				],
				typography_font_size: [
					'em-0',
					'px-1',
					'rem-0',
					'vw-0',
					'vw-5',
					'vw-10',
				],
				typography_line_height: [
					'em-0',
					'px-1',
				],
			},
		},
		'text-editor': {
			dependencies: {
				column_gap: {
					text_columns: '4',
				},
			},
			frontend_exclude: {
				column_gap: [
					'vw-5',
					'vw-10',
				],
				typography_font_size: [
					'em-0',
					'em-10',
					'px-1',
					'px-100.5',
					'px-200',
					'rem-0',
					'rem-10',
					'vw-0',
					'vw-10',
					'vw-5',
				],
				typography_line_height: [
					'em-0',
					'px-1',
				],
			},
		},
		divider: {
			dependencies: {
				align: {
					width: [ '%', '30' ],
				},
			},
			frontend_exclude: {
				style: [
					'trees_tribal',
				],
			},
		},
		button: {
			exclude: [
				'button_css_id', // Nothing changed
				'button_type', // Bug in the editor nothing changed.
			],
			frontend_exclude: {
				size: [
					'xs',
				],
				typography_font_size: [
					'px-1',
				],
			},
		},
		image: {
			dependencies: {
				'*': {
					image: 'elementor.png',
				},
			},
			exclude: [
				'image', // Image is affected in each control.
				'link_to', // Affect the link, nothing visual.
				'height', // Some bug in the CI, seems like this is a bug in the editor.
				'image_size', // Nothing visual.
			],
			frontend_exclude: {
				space: [
					'percentage-1',
					'vw-1',
				],
				width: [
					'vw-1',
					'vw-50.5',
				],
			},
		},
	},
};
