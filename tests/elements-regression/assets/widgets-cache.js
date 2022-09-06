// Copied from `elementor.widgetsCache`.
//
// const YOUR_WIDGET = 'WIDGET';
// Object.fromEntries( Object
// 	.entries( elementor.widgetsCache )
// 	.filter( ( [ name ] ) => name === YOUR_WIDGET )
// 	.map( ( [ widgetType, data ] ) => {
// 		const newControls = Object.fromEntries(
// 			Object.entries( data.controls )
// 				.filter( ( [ controlId, control ] ) => (
// 					'common' !== control.name &&
// 					'advanced' !== control.tab &&
// 					! [ 'heading' ].includes( control.type ) &&
// 					! controlId.match( /(tablet|mobile|laptop|mobile_extra)$/i )
// 				) )
// 				.map( ( [ controlId, control ] ) => {
// 					return [
// 						controlId,
// 						{
// 							name: control.name,
// 							tab: control.tab,
// 							section: control.section,
// 							type: control.type,
// 							...( control.render_type ? { render_type: control.render_type } : {} ),
// 							...( control.options ? { options: control.options } : {} ),
// 							...( control.popover ? { popover: true } : {} ),
// 							...( control.condition ? { condition: control.condition } : {} ),
// 							...( control.conditions ? { conditions: control.conditions } : {} ),
// 							...( control.size_units ? { size_units: control.size_units } : [] ),
// 							...( control.range ? { range: control.range } : {} ),
// 							...( control.groups ? { groups: control.groups } : {} ),
// 						},
// 					];
// 				} ),
// 		);
//
// 		return [
// 			widgetType,
// 			{
// 				controls: newControls,
// 			},
// 		];
// 	} ),
// );
module.exports = {
	heading: {
		controls: {
			section_title: {
				name: 'section_title',
				tab: 'content',
				type: 'section',
			},
			title: {
				name: 'title',
				tab: 'content',
				section: 'section_title',
				type: 'textarea',
			},
			link: {
				name: 'link',
				tab: 'content',
				section: 'section_title',
				type: 'url',
			},
			size: {
				name: 'size',
				tab: 'content',
				section: 'section_title',
				type: 'select',
				options: {
					default: 'Default',
					small: 'Small',
					medium: 'Medium',
					large: 'Large',
					xl: 'XL',
					xxl: 'XXL',
				},
			},
			header_size: {
				name: 'header_size',
				tab: 'content',
				section: 'section_title',
				type: 'select',
				options: {
					h1: 'H1',
					h2: 'H2',
					h3: 'H3',
					h4: 'H4',
					h5: 'H5',
					h6: 'H6',
					div: 'div',
					span: 'span',
					p: 'p',
				},
			},
			align: {
				name: 'align',
				tab: 'content',
				section: 'section_title',
				type: 'choose',
				options: {
					left: {
						title: 'Left',
						icon: 'eicon-text-align-left',
					},
					center: {
						title: 'Center',
						icon: 'eicon-text-align-center',
					},
					right: {
						title: 'Right',
						icon: 'eicon-text-align-right',
					},
					justify: {
						title: 'Justified',
						icon: 'eicon-text-align-justify',
					},
				},
			},
			view: {
				name: 'view',
				tab: 'content',
				section: 'section_title',
				type: 'hidden',
			},
			section_title_style: {
				name: 'section_title_style',
				tab: 'style',
				type: 'section',
			},
			title_color: {
				name: 'title_color',
				tab: 'style',
				section: 'section_title_style',
				type: 'color',
			},
			typography_typography: {
				name: 'typography_typography',
				tab: 'style',
				section: 'section_title_style',
				type: 'popover_toggle',
				render_type: 'ui',
			},
			typography_font_family: {
				name: 'typography_font_family',
				tab: 'style',
				section: 'section_title_style',
				type: 'font',
				popover: true,
				condition: {
					'typography_typography!': '',
				},
			},
			typography_font_size: {
				name: 'typography_font_size',
				tab: 'style',
				section: 'section_title_style',
				type: 'slider',
				popover: true,
				condition: {
					'typography_typography!': '',
				},
				size_units: [
					'px',
					'em',
					'rem',
					'vw',
				],
				range: {
					px: {
						min: 1,
						max: 200,
					},
					vw: {
						min: 0.1,
						max: 10,
						step: 0.1,
					},
				},
			},
			typography_font_weight: {
				name: 'typography_font_weight',
				tab: 'style',
				section: 'section_title_style',
				type: 'select',
				options: {
					100: '100',
					200: '200',
					300: '300',
					400: '400',
					500: '500',
					600: '600',
					700: '700',
					800: '800',
					900: '900',
					'': 'Default',
					normal: 'Normal',
					bold: 'Bold',
				},
				popover: true,
				condition: {
					'typography_typography!': '',
				},
			},
			typography_text_transform: {
				name: 'typography_text_transform',
				tab: 'style',
				section: 'section_title_style',
				type: 'select',
				options: {
					'': 'Default',
					uppercase: 'Uppercase',
					lowercase: 'Lowercase',
					capitalize: 'Capitalize',
					none: 'Normal',
				},
				popover: true,
				condition: {
					'typography_typography!': '',
				},
			},
			typography_font_style: {
				name: 'typography_font_style',
				tab: 'style',
				section: 'section_title_style',
				type: 'select',
				options: {
					'': 'Default',
					normal: 'Normal',
					italic: 'Italic',
					oblique: 'Oblique',
				},
				popover: true,
				condition: {
					'typography_typography!': '',
				},
			},
			typography_text_decoration: {
				name: 'typography_text_decoration',
				tab: 'style',
				section: 'section_title_style',
				type: 'select',
				options: {
					'': 'Default',
					underline: 'Underline',
					overline: 'Overline',
					'line-through': 'Line Through',
					none: 'None',
				},
				popover: true,
				condition: {
					'typography_typography!': '',
				},
			},
			typography_line_height: {
				name: 'typography_line_height',
				tab: 'style',
				section: 'section_title_style',
				type: 'slider',
				popover: true,
				condition: {
					'typography_typography!': '',
				},
				size_units: [
					'px',
					'em',
				],
				range: {
					px: {
						min: 1,
					},
				},
			},
			typography_letter_spacing: {
				name: 'typography_letter_spacing',
				tab: 'style',
				section: 'section_title_style',
				type: 'slider',
				popover: true,
				condition: {
					'typography_typography!': '',
				},
				range: {
					px: {
						min: -5,
						max: 10,
						step: 0.1,
					},
				},
			},
			typography_word_spacing: {
				name: 'typography_word_spacing',
				tab: 'style',
				section: 'section_title_style',
				type: 'slider',
				popover: true,
				condition: {
					'typography_typography!': '',
				},
				size_units: [
					'px',
					'em',
				],
				range: {
					px: {
						step: 1,
					},
					em: {
						step: 0.1,
					},
				},
			},
			text_stroke_text_stroke_type: {
				name: 'text_stroke_text_stroke_type',
				tab: 'style',
				section: 'section_title_style',
				type: 'popover_toggle',
				render_type: 'ui',
			},
			text_stroke_text_stroke: {
				name: 'text_stroke_text_stroke',
				tab: 'style',
				section: 'section_title_style',
				type: 'slider',
				popover: true,
				condition: {
					'text_stroke_text_stroke_type!': '',
				},
				size_units: [
					'px',
					'em',
					'rem',
				],
				range: {
					px: {
						min: 0,
						max: 10,
					},
					em: {
						min: 0,
						max: 1,
						step: 0.01,
					},
					rem: {
						min: 0,
						max: 1,
						step: 0.01,
					},
				},
			},
			text_stroke_stroke_color: {
				name: 'text_stroke_stroke_color',
				tab: 'style',
				section: 'section_title_style',
				type: 'color',
				popover: true,
				condition: {
					'text_stroke_text_stroke_type!': '',
				},
			},
			text_shadow_text_shadow_type: {
				name: 'text_shadow_text_shadow_type',
				tab: 'style',
				section: 'section_title_style',
				type: 'popover_toggle',
				render_type: 'ui',
			},
			text_shadow_text_shadow: {
				name: 'text_shadow_text_shadow',
				tab: 'style',
				section: 'section_title_style',
				type: 'text_shadow',
				popover: true,
				condition: {
					'text_shadow_text_shadow_type!': '',
				},
			},
			blend_mode: {
				name: 'blend_mode',
				tab: 'style',
				section: 'section_title_style',
				type: 'select',
				options: {
					'': 'Normal',
					multiply: 'Multiply',
					screen: 'Screen',
					overlay: 'Overlay',
					darken: 'Darken',
					lighten: 'Lighten',
					'color-dodge': 'Color Dodge',
					saturation: 'Saturation',
					color: 'Color',
					difference: 'Difference',
					exclusion: 'Exclusion',
					hue: 'Hue',
					luminosity: 'Luminosity',
				},
			},
		},
	},
	'text-editor': {
		controls: {
			section_editor: {
				name: 'section_editor',
				tab: 'content',
				type: 'section',
			},
			editor: {
				name: 'editor',
				tab: 'content',
				section: 'section_editor',
				type: 'wysiwyg',
			},
			drop_cap: {
				name: 'drop_cap',
				tab: 'content',
				section: 'section_editor',
				type: 'switcher',
			},
			text_columns: {
				name: 'text_columns',
				tab: 'content',
				section: 'section_editor',
				type: 'select',
				options: {
					1: 1,
					2: 2,
					3: 3,
					4: 4,
					5: 5,
					6: 6,
					7: 7,
					8: 8,
					9: 9,
					10: 10,
					'': 'Default',
				},
			},
			column_gap: {
				name: 'column_gap',
				tab: 'content',
				section: 'section_editor',
				type: 'slider',
				size_units: [
					'px',
					'%',
					'em',
					'vw',
				],
				range: {
					px: {
						max: 100,
					},
					'%': {
						max: 10,
						step: 0.1,
					},
					vw: {
						max: 10,
						step: 0.1,
					},
					em: {
						max: 10,
						step: 0.1,
					},
				},
			},
			section_style: {
				name: 'section_style',
				tab: 'style',
				type: 'section',
			},
			align: {
				name: 'align',
				tab: 'style',
				section: 'section_style',
				type: 'choose',
				options: {
					left: {
						title: 'Left',
						icon: 'eicon-text-align-left',
					},
					center: {
						title: 'Center',
						icon: 'eicon-text-align-center',
					},
					right: {
						title: 'Right',
						icon: 'eicon-text-align-right',
					},
					justify: {
						title: 'Justified',
						icon: 'eicon-text-align-justify',
					},
				},
			},
			text_color: {
				name: 'text_color',
				tab: 'style',
				section: 'section_style',
				type: 'color',
			},
			typography_typography: {
				name: 'typography_typography',
				tab: 'style',
				section: 'section_style',
				type: 'popover_toggle',
				render_type: 'ui',
			},
			typography_font_family: {
				name: 'typography_font_family',
				tab: 'style',
				section: 'section_style',
				type: 'font',
				popover: true,
				condition: {
					'typography_typography!': '',
				},
			},
			typography_font_size: {
				name: 'typography_font_size',
				tab: 'style',
				section: 'section_style',
				type: 'slider',
				popover: true,
				condition: {
					'typography_typography!': '',
				},
				size_units: [
					'px',
					'em',
					'rem',
					'vw',
				],
				range: {
					px: {
						min: 1,
						max: 200,
					},
					vw: {
						min: 0.1,
						max: 10,
						step: 0.1,
					},
				},
			},
			typography_font_weight: {
				name: 'typography_font_weight',
				tab: 'style',
				section: 'section_style',
				type: 'select',
				options: {
					100: '100',
					200: '200',
					300: '300',
					400: '400',
					500: '500',
					600: '600',
					700: '700',
					800: '800',
					900: '900',
					'': 'Default',
					normal: 'Normal',
					bold: 'Bold',
				},
				popover: true,
				condition: {
					'typography_typography!': '',
				},
			},
			typography_text_transform: {
				name: 'typography_text_transform',
				tab: 'style',
				section: 'section_style',
				type: 'select',
				options: {
					'': 'Default',
					uppercase: 'Uppercase',
					lowercase: 'Lowercase',
					capitalize: 'Capitalize',
					none: 'Normal',
				},
				popover: true,
				condition: {
					'typography_typography!': '',
				},
			},
			typography_font_style: {
				name: 'typography_font_style',
				tab: 'style',
				section: 'section_style',
				type: 'select',
				options: {
					'': 'Default',
					normal: 'Normal',
					italic: 'Italic',
					oblique: 'Oblique',
				},
				popover: true,
				condition: {
					'typography_typography!': '',
				},
			},
			typography_text_decoration: {
				name: 'typography_text_decoration',
				tab: 'style',
				section: 'section_style',
				type: 'select',
				options: {
					'': 'Default',
					underline: 'Underline',
					overline: 'Overline',
					'line-through': 'Line Through',
					none: 'None',
				},
				popover: true,
				condition: {
					'typography_typography!': '',
				},
			},
			typography_line_height: {
				name: 'typography_line_height',
				tab: 'style',
				section: 'section_style',
				type: 'slider',
				popover: true,
				condition: {
					'typography_typography!': '',
				},
				size_units: [
					'px',
					'em',
				],
				range: {
					px: {
						min: 1,
					},
				},
			},
			typography_letter_spacing: {
				name: 'typography_letter_spacing',
				tab: 'style',
				section: 'section_style',
				type: 'slider',
				popover: true,
				condition: {
					'typography_typography!': '',
				},
				range: {
					px: {
						min: -5,
						max: 10,
						step: 0.1,
					},
				},
			},
			typography_word_spacing: {
				name: 'typography_word_spacing',
				tab: 'style',
				section: 'section_style',
				type: 'slider',
				popover: true,
				condition: {
					'typography_typography!': '',
				},
				size_units: [
					'px',
					'em',
				],
				range: {
					px: {
						step: 1,
					},
					em: {
						step: 0.1,
					},
				},
			},
			text_shadow_text_shadow_type: {
				name: 'text_shadow_text_shadow_type',
				tab: 'style',
				section: 'section_style',
				type: 'popover_toggle',
				render_type: 'ui',
			},
			text_shadow_text_shadow: {
				name: 'text_shadow_text_shadow',
				tab: 'style',
				section: 'section_style',
				type: 'text_shadow',
				popover: true,
				condition: {
					'text_shadow_text_shadow_type!': '',
				},
			},
			section_drop_cap: {
				name: 'section_drop_cap',
				tab: 'style',
				type: 'section',
				condition: {
					drop_cap: 'yes',
				},
			},
			drop_cap_view: {
				name: 'drop_cap_view',
				tab: 'style',
				section: 'section_drop_cap',
				type: 'select',
				options: {
					default: 'Default',
					stacked: 'Stacked',
					framed: 'Framed',
				},
				condition: {
					drop_cap: 'yes',
				},
			},
			drop_cap_primary_color: {
				name: 'drop_cap_primary_color',
				tab: 'style',
				section: 'section_drop_cap',
				type: 'color',
				condition: {
					drop_cap: 'yes',
				},
			},
			drop_cap_secondary_color: {
				name: 'drop_cap_secondary_color',
				tab: 'style',
				section: 'section_drop_cap',
				type: 'color',
				condition: {
					drop_cap: 'yes',
					'drop_cap_view!': 'default',
				},
			},
			drop_cap_shadow_text_shadow_type: {
				name: 'drop_cap_shadow_text_shadow_type',
				tab: 'style',
				section: 'section_drop_cap',
				type: 'popover_toggle',
				render_type: 'ui',
				condition: {
					drop_cap: 'yes',
				},
			},
			drop_cap_shadow_text_shadow: {
				name: 'drop_cap_shadow_text_shadow',
				tab: 'style',
				section: 'section_drop_cap',
				type: 'text_shadow',
				popover: true,
				condition: {
					drop_cap: 'yes',
					'drop_cap_shadow_text_shadow_type!': '',
				},
			},
			drop_cap_size: {
				name: 'drop_cap_size',
				tab: 'style',
				section: 'section_drop_cap',
				type: 'slider',
				condition: {
					drop_cap: 'yes',
					'drop_cap_view!': 'default',
				},
				range: {
					px: {
						max: 30,
					},
				},
			},
			drop_cap_space: {
				name: 'drop_cap_space',
				tab: 'style',
				section: 'section_drop_cap',
				type: 'slider',
				condition: {
					drop_cap: 'yes',
				},
				range: {
					px: {
						max: 50,
					},
				},
			},
			drop_cap_border_radius: {
				name: 'drop_cap_border_radius',
				tab: 'style',
				section: 'section_drop_cap',
				type: 'slider',
				condition: {
					drop_cap: 'yes',
				},
				size_units: [
					'%',
					'px',
				],
				range: {
					'%': {
						max: 50,
					},
				},
			},
			drop_cap_border_width: {
				name: 'drop_cap_border_width',
				tab: 'style',
				section: 'section_drop_cap',
				type: 'dimensions',
				condition: {
					drop_cap: 'yes',
					drop_cap_view: 'framed',
				},
			},
			drop_cap_typography_typography: {
				name: 'drop_cap_typography_typography',
				tab: 'style',
				section: 'section_drop_cap',
				type: 'popover_toggle',
				render_type: 'ui',
				condition: {
					drop_cap: 'yes',
				},
			},
			drop_cap_typography_font_family: {
				name: 'drop_cap_typography_font_family',
				tab: 'style',
				section: 'section_drop_cap',
				type: 'font',
				popover: true,
				condition: {
					drop_cap: 'yes',
					'drop_cap_typography_typography!': '',
				},
			},
			drop_cap_typography_font_size: {
				name: 'drop_cap_typography_font_size',
				tab: 'style',
				section: 'section_drop_cap',
				type: 'slider',
				popover: true,
				condition: {
					drop_cap: 'yes',
					'drop_cap_typography_typography!': '',
				},
				size_units: [
					'px',
					'em',
					'rem',
					'vw',
				],
				range: {
					px: {
						min: 1,
						max: 200,
					},
					vw: {
						min: 0.1,
						max: 10,
						step: 0.1,
					},
				},
			},
			drop_cap_typography_font_weight: {
				name: 'drop_cap_typography_font_weight',
				tab: 'style',
				section: 'section_drop_cap',
				type: 'select',
				options: {
					100: '100',
					200: '200',
					300: '300',
					400: '400',
					500: '500',
					600: '600',
					700: '700',
					800: '800',
					900: '900',
					'': 'Default',
					normal: 'Normal',
					bold: 'Bold',
				},
				popover: true,
				condition: {
					drop_cap: 'yes',
					'drop_cap_typography_typography!': '',
				},
			},
			drop_cap_typography_text_transform: {
				name: 'drop_cap_typography_text_transform',
				tab: 'style',
				section: 'section_drop_cap',
				type: 'select',
				options: {
					'': 'Default',
					uppercase: 'Uppercase',
					lowercase: 'Lowercase',
					capitalize: 'Capitalize',
					none: 'Normal',
				},
				popover: true,
				condition: {
					drop_cap: 'yes',
					'drop_cap_typography_typography!': '',
				},
			},
			drop_cap_typography_font_style: {
				name: 'drop_cap_typography_font_style',
				tab: 'style',
				section: 'section_drop_cap',
				type: 'select',
				options: {
					'': 'Default',
					normal: 'Normal',
					italic: 'Italic',
					oblique: 'Oblique',
				},
				popover: true,
				condition: {
					drop_cap: 'yes',
					'drop_cap_typography_typography!': '',
				},
			},
			drop_cap_typography_text_decoration: {
				name: 'drop_cap_typography_text_decoration',
				tab: 'style',
				section: 'section_drop_cap',
				type: 'select',
				options: {
					'': 'Default',
					underline: 'Underline',
					overline: 'Overline',
					'line-through': 'Line Through',
					none: 'None',
				},
				popover: true,
				condition: {
					drop_cap: 'yes',
					'drop_cap_typography_typography!': '',
				},
			},
			drop_cap_typography_line_height: {
				name: 'drop_cap_typography_line_height',
				tab: 'style',
				section: 'section_drop_cap',
				type: 'slider',
				popover: true,
				condition: {
					drop_cap: 'yes',
					'drop_cap_typography_typography!': '',
				},
				size_units: [
					'px',
					'em',
				],
				range: {
					px: {
						min: 1,
					},
				},
			},
			drop_cap_typography_word_spacing: {
				name: 'drop_cap_typography_word_spacing',
				tab: 'style',
				section: 'section_drop_cap',
				type: 'slider',
				popover: true,
				condition: {
					drop_cap: 'yes',
					'drop_cap_typography_typography!': '',
				},
				size_units: [
					'px',
					'em',
				],
				range: {
					px: {
						step: 1,
					},
					em: {
						step: 0.1,
					},
				},
			},
		},
	},
	divider: {
		controls: {
			section_divider: {
				name: 'section_divider',
				tab: 'content',
				type: 'section',
			},
			style: {
				name: 'style',
				tab: 'content',
				section: 'section_divider',
				type: 'select',
				render_type: 'template',
				groups: [
					{
						label: 'Line',
						options: {
							solid: 'Solid',
							double: 'Double',
							dotted: 'Dotted',
							dashed: 'Dashed',
							curly: 'Curly',
							curved: 'Curved',
							slashes: 'Slashes',
							squared: 'Squared',
							wavy: 'Wavy',
							zigzag: 'Zigzag',
						},
					},
					{
						label: 'Pattern',
						options: {
							multiple: 'Multiple',
							arrows: 'Arrows',
							pluses: 'Pluses',
							rhombus: 'Rhombus',
							parallelogram: 'Parallelogram',
							rectangles: 'Rectangles',
						},
					},
					{
						label: 'Tribal',
						options: {
							dots_tribal: 'Dots',
							trees_2_tribal: 'Fir Tree',
							rounds_tribal: 'Half Rounds',
							leaves_tribal: 'Leaves',
							stripes_tribal: 'Stripes',
							squares_tribal: 'Squares',
							trees_tribal: 'Trees',
							planes_tribal: 'Tribal',
							x_tribal: 'X',
							zigzag_tribal: 'Zigzag',
						},
					},
				],
			},
			separator_type: {
				name: 'separator_type',
				tab: 'content',
				section: 'section_divider',
				type: 'hidden',
				render_type: 'template',
				condition: {
					'style!': [
						'',
						'solid',
						'double',
						'dotted',
						'dashed',
					],
				},
			},
			pattern_spacing_flag: {
				name: 'pattern_spacing_flag',
				tab: 'content',
				section: 'section_divider',
				type: 'hidden',
				render_type: 'template',
				condition: {
					style: [
						'multiple',
						'dots_tribal',
						'trees_2_tribal',
						'rounds_tribal',
						'leaves_tribal',
						'stripes_tribal',
						'squares_tribal',
						'trees_tribal',
						'planes_tribal',
						'x_tribal',
						'zigzag_tribal',
					],
				},
			},
			pattern_round_flag: {
				name: 'pattern_round_flag',
				tab: 'content',
				section: 'section_divider',
				type: 'hidden',
				condition: {
					style: [
						'arrows',
						'rectangles',
					],
				},
			},
			width: {
				name: 'width',
				tab: 'content',
				section: 'section_divider',
				type: 'slider',
				size_units: [
					'%',
					'px',
				],
				range: {
					px: {
						max: 1000,
					},
				},
			},
			align: {
				name: 'align',
				tab: 'content',
				section: 'section_divider',
				type: 'choose',
				options: {
					left: {
						title: 'Left',
						icon: 'eicon-text-align-left',
					},
					center: {
						title: 'Center',
						icon: 'eicon-text-align-center',
					},
					right: {
						title: 'Right',
						icon: 'eicon-text-align-right',
					},
				},
			},
			look: {
				name: 'look',
				tab: 'content',
				section: 'section_divider',
				type: 'choose',
				render_type: 'template',
				options: {
					line: {
						title: 'None',
						icon: 'eicon-ban',
					},
					line_text: {
						title: 'Text',
						icon: 'eicon-t-letter-bold',
					},
					line_icon: {
						title: 'Icon',
						icon: 'eicon-star',
					},
				},
			},
			view: {
				name: 'view',
				tab: 'content',
				section: 'section_divider',
				type: 'hidden',
			},
			text: {
				name: 'text',
				tab: 'content',
				section: 'section_divider',
				type: 'text',
				condition: {
					look: 'line_text',
				},
			},
			html_tag: {
				name: 'html_tag',
				tab: 'content',
				section: 'section_divider',
				type: 'select',
				options: {
					h1: 'H1',
					h2: 'H2',
					h3: 'H3',
					h4: 'H4',
					h5: 'H5',
					h6: 'H6',
					div: 'div',
					span: 'span',
					p: 'p',
				},
				condition: {
					look: 'line_text',
				},
			},
			icon: {
				name: 'icon',
				tab: 'content',
				section: 'section_divider',
				type: 'icons',
				condition: {
					look: 'line_icon',
				},
			},
			section_divider_style: {
				name: 'section_divider_style',
				tab: 'style',
				type: 'section',
				condition: {
					'style!': 'none',
				},
			},
			color: {
				name: 'color',
				tab: 'style',
				section: 'section_divider_style',
				type: 'color',
				render_type: 'template',
				condition: {
					'style!': 'none',
				},
			},
			weight: {
				name: 'weight',
				tab: 'style',
				section: 'section_divider_style',
				type: 'slider',
				render_type: 'template',
				condition: {
					'style!': 'none',
					style: [
						'solid',
						'double',
						'dotted',
						'dashed',
						'curly',
						'curved',
						'slashes',
						'squared',
						'wavy',
						'zigzag',
					],
				},
				range: {
					px: {
						min: 1,
						max: 10,
						step: 0.1,
					},
				},
			},
			pattern_height: {
				name: 'pattern_height',
				tab: 'style',
				section: 'section_divider_style',
				type: 'slider',
				condition: {
					'style!': [
						'',
						'solid',
						'double',
						'dotted',
						'dashed',
					],
				},
				range: {
					px: {
						step: 0.1,
					},
				},
			},
			pattern_size: {
				name: 'pattern_size',
				tab: 'style',
				section: 'section_divider_style',
				type: 'slider',
				condition: {
					'style!': [
						'multiple',
						'dots_tribal',
						'trees_2_tribal',
						'rounds_tribal',
						'leaves_tribal',
						'stripes_tribal',
						'squares_tribal',
						'trees_tribal',
						'planes_tribal',
						'x_tribal',
						'zigzag_tribal',
						'',
						'solid',
						'double',
						'dotted',
						'dashed',
					],
				},
				size_units: [
					'%',
					'px',
				],
				range: {
					px: {
						step: 0.1,
					},
					'%': {
						step: 0.01,
					},
				},
			},
			gap: {
				name: 'gap',
				tab: 'style',
				section: 'section_divider_style',
				type: 'slider',
				condition: {
					'style!': 'none',
				},
				range: {
					px: {
						min: 2,
						max: 50,
					},
				},
			},
			section_text_style: {
				name: 'section_text_style',
				tab: 'style',
				type: 'section',
				condition: {
					look: 'line_text',
				},
			},
			text_color: {
				name: 'text_color',
				tab: 'style',
				section: 'section_text_style',
				type: 'color',
				condition: {
					look: 'line_text',
				},
			},
			typography_typography: {
				name: 'typography_typography',
				tab: 'style',
				section: 'section_text_style',
				type: 'popover_toggle',
				render_type: 'ui',
				condition: {
					look: 'line_text',
				},
			},
			typography_font_family: {
				name: 'typography_font_family',
				tab: 'style',
				section: 'section_text_style',
				type: 'font',
				popover: true,
				condition: {
					look: 'line_text',
					'typography_typography!': '',
				},
			},
			typography_font_size: {
				name: 'typography_font_size',
				tab: 'style',
				section: 'section_text_style',
				type: 'slider',
				popover: true,
				condition: {
					look: 'line_text',
					'typography_typography!': '',
				},
				size_units: [
					'px',
					'em',
					'rem',
					'vw',
				],
				range: {
					px: {
						min: 1,
						max: 200,
					},
					vw: {
						min: 0.1,
						max: 10,
						step: 0.1,
					},
				},
			},
			typography_font_weight: {
				name: 'typography_font_weight',
				tab: 'style',
				section: 'section_text_style',
				type: 'select',
				options: {
					100: '100',
					200: '200',
					300: '300',
					400: '400',
					500: '500',
					600: '600',
					700: '700',
					800: '800',
					900: '900',
					'': 'Default',
					normal: 'Normal',
					bold: 'Bold',
				},
				popover: true,
				condition: {
					look: 'line_text',
					'typography_typography!': '',
				},
			},
			typography_text_transform: {
				name: 'typography_text_transform',
				tab: 'style',
				section: 'section_text_style',
				type: 'select',
				options: {
					'': 'Default',
					uppercase: 'Uppercase',
					lowercase: 'Lowercase',
					capitalize: 'Capitalize',
					none: 'Normal',
				},
				popover: true,
				condition: {
					look: 'line_text',
					'typography_typography!': '',
				},
			},
			typography_font_style: {
				name: 'typography_font_style',
				tab: 'style',
				section: 'section_text_style',
				type: 'select',
				options: {
					'': 'Default',
					normal: 'Normal',
					italic: 'Italic',
					oblique: 'Oblique',
				},
				popover: true,
				condition: {
					look: 'line_text',
					'typography_typography!': '',
				},
			},
			typography_text_decoration: {
				name: 'typography_text_decoration',
				tab: 'style',
				section: 'section_text_style',
				type: 'select',
				options: {
					'': 'Default',
					underline: 'Underline',
					overline: 'Overline',
					'line-through': 'Line Through',
					none: 'None',
				},
				popover: true,
				condition: {
					look: 'line_text',
					'typography_typography!': '',
				},
			},
			typography_line_height: {
				name: 'typography_line_height',
				tab: 'style',
				section: 'section_text_style',
				type: 'slider',
				popover: true,
				condition: {
					look: 'line_text',
					'typography_typography!': '',
				},
				size_units: [
					'px',
					'em',
				],
				range: {
					px: {
						min: 1,
					},
				},
			},
			typography_letter_spacing: {
				name: 'typography_letter_spacing',
				tab: 'style',
				section: 'section_text_style',
				type: 'slider',
				popover: true,
				condition: {
					look: 'line_text',
					'typography_typography!': '',
				},
				range: {
					px: {
						min: -5,
						max: 10,
						step: 0.1,
					},
				},
			},
			typography_word_spacing: {
				name: 'typography_word_spacing',
				tab: 'style',
				section: 'section_text_style',
				type: 'slider',
				popover: true,
				condition: {
					look: 'line_text',
					'typography_typography!': '',
				},
				size_units: [
					'px',
					'em',
				],
				range: {
					px: {
						step: 1,
					},
					em: {
						step: 0.1,
					},
				},
			},
			text_align: {
				name: 'text_align',
				tab: 'style',
				section: 'section_text_style',
				type: 'choose',
				options: {
					left: {
						title: 'Left',
						icon: 'eicon-h-align-left',
					},
					center: {
						title: 'Center',
						icon: 'eicon-h-align-center',
					},
					right: {
						title: 'Right',
						icon: 'eicon-h-align-right',
					},
				},
				condition: {
					look: 'line_text',
				},
			},
			text_spacing: {
				name: 'text_spacing',
				tab: 'style',
				section: 'section_text_style',
				type: 'slider',
				condition: {
					look: 'line_text',
				},
				range: {
					px: {
						min: 0,
						max: 50,
					},
				},
			},
			section_icon_style: {
				name: 'section_icon_style',
				tab: 'style',
				type: 'section',
				condition: {
					look: 'line_icon',
				},
			},
			icon_view: {
				name: 'icon_view',
				tab: 'style',
				section: 'section_icon_style',
				type: 'select',
				options: {
					default: 'Default',
					stacked: 'Stacked',
					framed: 'Framed',
				},
				condition: {
					look: 'line_icon',
				},
			},
			icon_size: {
				name: 'icon_size',
				tab: 'style',
				section: 'section_icon_style',
				type: 'slider',
				condition: {
					look: 'line_icon',
				},
				range: {
					px: {
						min: 6,
						max: 300,
					},
				},
			},
			icon_padding: {
				name: 'icon_padding',
				tab: 'style',
				section: 'section_icon_style',
				type: 'slider',
				condition: {
					look: 'line_icon',
					'icon_view!': 'default',
				},
				range: {
					em: {
						min: 0,
						max: 5,
					},
				},
			},
			primary_color: {
				name: 'primary_color',
				tab: 'style',
				section: 'section_icon_style',
				type: 'color',
				condition: {
					look: 'line_icon',
				},
			},
			secondary_color: {
				name: 'secondary_color',
				tab: 'style',
				section: 'section_icon_style',
				type: 'color',
				condition: {
					look: 'line_icon',
					'icon_view!': 'default',
				},
			},
			icon_align: {
				name: 'icon_align',
				tab: 'style',
				section: 'section_icon_style',
				type: 'choose',
				options: {
					left: {
						title: 'Left',
						icon: 'eicon-h-align-left',
					},
					center: {
						title: 'Center',
						icon: 'eicon-h-align-center',
					},
					right: {
						title: 'Right',
						icon: 'eicon-h-align-right',
					},
				},
				condition: {
					look: 'line_icon',
				},
			},
			icon_spacing: {
				name: 'icon_spacing',
				tab: 'style',
				section: 'section_icon_style',
				type: 'slider',
				condition: {
					look: 'line_icon',
				},
				range: {
					px: {
						min: 0,
						max: 50,
					},
				},
			},
			rotate: {
				name: 'rotate',
				tab: 'style',
				section: 'section_icon_style',
				type: 'slider',
				condition: {
					look: 'line_icon',
				},
				size_units: [
					'deg',
				],
			},
			icon_border_width: {
				name: 'icon_border_width',
				tab: 'style',
				section: 'section_icon_style',
				type: 'slider',
				condition: {
					look: 'line_icon',
					icon_view: 'framed',
				},
			},
			border_radius: {
				name: 'border_radius',
				tab: 'style',
				section: 'section_icon_style',
				type: 'slider',
				condition: {
					look: 'line_icon',
					'icon_view!': 'default',
				},
				size_units: [
					'px',
					'%',
				],
			},
		},
	},
};
