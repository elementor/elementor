// Copied from `elementor.widgetsCache`.
module.exports = {
	button: {
		controls: {
			section_button: {
					name: 'section_button',
					tab: 'content',
					type: 'section',
			},
			button_type: {
					name: 'button_type',
					tab: 'content',
					section: 'section_button',
					type: 'select',
					options: {
							'': 'Default',
							info: 'Info',
							success: 'Success',
							warning: 'Warning',
							danger: 'Danger',
					},
					condition: [],
			},
			text: {
					name: 'text',
					tab: 'content',
					section: 'section_button',
					type: 'text',
					condition: [],
			},
			link: {
					name: 'link',
					tab: 'content',
					section: 'section_button',
					type: 'url',
					condition: [],
			},
			align: {
					name: 'align',
					tab: 'content',
					section: 'section_button',
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
					condition: [],
			},
			align_widescreen: {
					name: 'align_widescreen',
					tab: 'content',
					section: 'section_button',
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
					condition: [],
			},
			align_tablet_extra: {
					name: 'align_tablet_extra',
					tab: 'content',
					section: 'section_button',
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
					condition: [],
			},
			size: {
					name: 'size',
					tab: 'content',
					section: 'section_button',
					type: 'select',
					options: {
							xs: 'Extra Small',
							sm: 'Small',
							md: 'Medium',
							lg: 'Large',
							xl: 'Extra Large',
					},
					condition: [],
			},
			selected_icon: {
					name: 'selected_icon',
					tab: 'content',
					section: 'section_button',
					type: 'icons',
					condition: [],
			},
			icon_align: {
					name: 'icon_align',
					tab: 'content',
					section: 'section_button',
					type: 'select',
					options: {
							left: 'Before',
							right: 'After',
					},
					condition: {
							'selected_icon[value]!': '',
					},
			},
			icon_indent: {
					name: 'icon_indent',
					tab: 'content',
					section: 'section_button',
					type: 'slider',
					condition: [],
			},
			view: {
					name: 'view',
					tab: 'content',
					section: 'section_button',
					type: 'hidden',
					condition: [],
			},
			button_css_id: {
					name: 'button_css_id',
					tab: 'content',
					section: 'section_button',
					type: 'text',
					condition: [],
			},
			section_style: {
					name: 'section_style',
					tab: 'style',
					type: 'section',
			},
			typography_typography: {
					name: 'typography_typography',
					tab: 'style',
					section: 'section_style',
					type: 'popover_toggle',
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
			},
			typography_font_size_widescreen: {
					name: 'typography_font_size_widescreen',
					tab: 'style',
					section: 'section_style',
					type: 'slider',
					popover: true,
					condition: {
							'typography_typography!': '',
					},
			},
			typography_font_size_tablet_extra: {
					name: 'typography_font_size_tablet_extra',
					tab: 'style',
					section: 'section_style',
					type: 'slider',
					popover: true,
					condition: {
							'typography_typography!': '',
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
			},
			typography_line_height_widescreen: {
					name: 'typography_line_height_widescreen',
					tab: 'style',
					section: 'section_style',
					type: 'slider',
					popover: true,
					condition: {
							'typography_typography!': '',
					},
			},
			typography_line_height_tablet_extra: {
					name: 'typography_line_height_tablet_extra',
					tab: 'style',
					section: 'section_style',
					type: 'slider',
					popover: true,
					condition: {
							'typography_typography!': '',
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
			},
			typography_letter_spacing_widescreen: {
					name: 'typography_letter_spacing_widescreen',
					tab: 'style',
					section: 'section_style',
					type: 'slider',
					popover: true,
					condition: {
							'typography_typography!': '',
					},
			},
			typography_letter_spacing_tablet_extra: {
					name: 'typography_letter_spacing_tablet_extra',
					tab: 'style',
					section: 'section_style',
					type: 'slider',
					popover: true,
					condition: {
							'typography_typography!': '',
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
			},
			typography_word_spacing_widescreen: {
					name: 'typography_word_spacing_widescreen',
					tab: 'style',
					section: 'section_style',
					type: 'slider',
					popover: true,
					condition: {
							'typography_typography!': '',
					},
			},
			typography_word_spacing_tablet_extra: {
					name: 'typography_word_spacing_tablet_extra',
					tab: 'style',
					section: 'section_style',
					type: 'slider',
					popover: true,
					condition: {
							'typography_typography!': '',
					},
			},
			text_shadow_text_shadow_type: {
					name: 'text_shadow_text_shadow_type',
					tab: 'style',
					section: 'section_style',
					type: 'popover_toggle',
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
			tabs_button_style: {
					name: 'tabs_button_style',
					tab: 'style',
					section: 'section_style',
					type: 'tabs',
					condition: [],
			},
			tab_button_normal: {
					name: 'tab_button_normal',
					tab: 'style',
					section: 'section_style',
					type: 'tab',
					condition: [],
			},
			button_text_color: {
					name: 'button_text_color',
					tab: 'style',
					section: 'section_style',
					type: 'color',
					condition: [],
			},
			background_background: {
					name: 'background_background',
					tab: 'style',
					section: 'section_style',
					type: 'choose',
					options: {
							classic: {
									title: 'Classic',
									icon: 'eicon-paint-brush',
							},
							gradient: {
									title: 'Gradient',
									icon: 'eicon-barcode',
							},
					},
			},
			background_color: {
					name: 'background_color',
					tab: 'style',
					section: 'section_style',
					type: 'color',
					condition: {
							background_background: [
									'classic',
									'gradient',
							],
					},
			},
			background_color_stop: {
					name: 'background_color_stop',
					tab: 'style',
					section: 'section_style',
					type: 'slider',
					condition: {
							background_background: [
									'gradient',
							],
					},
			},
			background_color_b: {
					name: 'background_color_b',
					tab: 'style',
					section: 'section_style',
					type: 'color',
					condition: {
							background_background: [
									'gradient',
							],
					},
			},
			background_color_b_stop: {
					name: 'background_color_b_stop',
					tab: 'style',
					section: 'section_style',
					type: 'slider',
					condition: {
							background_background: [
									'gradient',
							],
					},
			},
			background_gradient_type: {
					name: 'background_gradient_type',
					tab: 'style',
					section: 'section_style',
					type: 'select',
					options: {
							linear: 'Linear',
							radial: 'Radial',
					},
					condition: {
							background_background: [
									'gradient',
							],
					},
			},
			background_gradient_angle: {
					name: 'background_gradient_angle',
					tab: 'style',
					section: 'section_style',
					type: 'slider',
					condition: {
							background_background: [
									'gradient',
							],
							background_gradient_type: 'linear',
					},
			},
			background_gradient_position: {
					name: 'background_gradient_position',
					tab: 'style',
					section: 'section_style',
					type: 'select',
					options: {
							'center center': 'Center Center',
							'center left': 'Center Left',
							'center right': 'Center Right',
							'top center': 'Top Center',
							'top left': 'Top Left',
							'top right': 'Top Right',
							'bottom center': 'Bottom Center',
							'bottom left': 'Bottom Left',
							'bottom right': 'Bottom Right',
					},
					condition: {
							background_background: [
									'gradient',
							],
							background_gradient_type: 'radial',
					},
			},
			background_position: {
					name: 'background_position',
					tab: 'style',
					section: 'section_style',
					type: 'select',
					options: {
							'': 'Default',
							'center center': 'Center Center',
							'center left': 'Center Left',
							'center right': 'Center Right',
							'top center': 'Top Center',
							'top left': 'Top Left',
							'top right': 'Top Right',
							'bottom center': 'Bottom Center',
							'bottom left': 'Bottom Left',
							'bottom right': 'Bottom Right',
							initial: 'Custom',
					},
					condition: {
							background_background: [
									'classic',
							],
							'background_image[url]!': '',
					},
			},
			background_position_widescreen: {
					name: 'background_position_widescreen',
					tab: 'style',
					section: 'section_style',
					type: 'select',
					options: {
							'': 'Default',
							'center center': 'Center Center',
							'center left': 'Center Left',
							'center right': 'Center Right',
							'top center': 'Top Center',
							'top left': 'Top Left',
							'top right': 'Top Right',
							'bottom center': 'Bottom Center',
							'bottom left': 'Bottom Left',
							'bottom right': 'Bottom Right',
							initial: 'Custom',
					},
					condition: {
							background_background: [
									'classic',
							],
							'background_image[url]!': '',
					},
			},
			background_position_tablet_extra: {
					name: 'background_position_tablet_extra',
					tab: 'style',
					section: 'section_style',
					type: 'select',
					options: {
							'': 'Default',
							'center center': 'Center Center',
							'center left': 'Center Left',
							'center right': 'Center Right',
							'top center': 'Top Center',
							'top left': 'Top Left',
							'top right': 'Top Right',
							'bottom center': 'Bottom Center',
							'bottom left': 'Bottom Left',
							'bottom right': 'Bottom Right',
							initial: 'Custom',
					},
					condition: {
							background_background: [
									'classic',
							],
							'background_image[url]!': '',
					},
			},
			background_xpos: {
					name: 'background_xpos',
					tab: 'style',
					section: 'section_style',
					type: 'slider',
					condition: {
							background_background: [
									'classic',
							],
							background_position: [
									'initial',
							],
							'background_image[url]!': '',
					},
			},
			background_xpos_widescreen: {
					name: 'background_xpos_widescreen',
					tab: 'style',
					section: 'section_style',
					type: 'slider',
					condition: {
							background_background: [
									'classic',
							],
							background_position: [
									'initial',
							],
							'background_image[url]!': '',
					},
			},
			background_xpos_tablet_extra: {
					name: 'background_xpos_tablet_extra',
					tab: 'style',
					section: 'section_style',
					type: 'slider',
					condition: {
							background_background: [
									'classic',
							],
							background_position: [
									'initial',
							],
							'background_image[url]!': '',
					},
			},
			background_ypos: {
					name: 'background_ypos',
					tab: 'style',
					section: 'section_style',
					type: 'slider',
					condition: {
							background_background: [
									'classic',
							],
							background_position: [
									'initial',
							],
							'background_image[url]!': '',
					},
			},
			background_ypos_widescreen: {
					name: 'background_ypos_widescreen',
					tab: 'style',
					section: 'section_style',
					type: 'slider',
					condition: {
							background_background: [
									'classic',
							],
							background_position: [
									'initial',
							],
							'background_image[url]!': '',
					},
			},
			background_ypos_tablet_extra: {
					name: 'background_ypos_tablet_extra',
					tab: 'style',
					section: 'section_style',
					type: 'slider',
					condition: {
							background_background: [
									'classic',
							],
							background_position: [
									'initial',
							],
							'background_image[url]!': '',
					},
			},
			background_attachment: {
					name: 'background_attachment',
					tab: 'style',
					section: 'section_style',
					type: 'select',
					options: {
							'': 'Default',
							scroll: 'Scroll',
							fixed: 'Fixed',
					},
					condition: {
							background_background: [
									'classic',
							],
							'background_image[url]!': '',
					},
			},
			background_attachment_alert: {
					name: 'background_attachment_alert',
					tab: 'style',
					section: 'section_style',
					type: 'raw_html',
					condition: {
							background_background: [
									'classic',
							],
							'background_image[url]!': '',
							background_attachment: 'fixed',
					},
			},
			background_repeat: {
					name: 'background_repeat',
					tab: 'style',
					section: 'section_style',
					type: 'select',
					options: {
							'': 'Default',
							'no-repeat': 'No-repeat',
							repeat: 'Repeat',
							'repeat-x': 'Repeat-x',
							'repeat-y': 'Repeat-y',
					},
					condition: {
							background_background: [
									'classic',
							],
							'background_image[url]!': '',
					},
			},
			background_repeat_widescreen: {
					name: 'background_repeat_widescreen',
					tab: 'style',
					section: 'section_style',
					type: 'select',
					options: {
							'': 'Default',
							'no-repeat': 'No-repeat',
							repeat: 'Repeat',
							'repeat-x': 'Repeat-x',
							'repeat-y': 'Repeat-y',
					},
					condition: {
							background_background: [
									'classic',
							],
							'background_image[url]!': '',
					},
			},
			background_repeat_tablet_extra: {
					name: 'background_repeat_tablet_extra',
					tab: 'style',
					section: 'section_style',
					type: 'select',
					options: {
							'': 'Default',
							'no-repeat': 'No-repeat',
							repeat: 'Repeat',
							'repeat-x': 'Repeat-x',
							'repeat-y': 'Repeat-y',
					},
					condition: {
							background_background: [
									'classic',
							],
							'background_image[url]!': '',
					},
			},
			background_size: {
					name: 'background_size',
					tab: 'style',
					section: 'section_style',
					type: 'select',
					options: {
							'': 'Default',
							auto: 'Auto',
							cover: 'Cover',
							contain: 'Contain',
							initial: 'Custom',
					},
					condition: {
							background_background: [
									'classic',
							],
							'background_image[url]!': '',
					},
			},
			background_size_widescreen: {
					name: 'background_size_widescreen',
					tab: 'style',
					section: 'section_style',
					type: 'select',
					options: {
							'': 'Default',
							auto: 'Auto',
							cover: 'Cover',
							contain: 'Contain',
							initial: 'Custom',
					},
					condition: {
							background_background: [
									'classic',
							],
							'background_image[url]!': '',
					},
			},
			background_size_tablet_extra: {
					name: 'background_size_tablet_extra',
					tab: 'style',
					section: 'section_style',
					type: 'select',
					options: {
							'': 'Default',
							auto: 'Auto',
							cover: 'Cover',
							contain: 'Contain',
							initial: 'Custom',
					},
					condition: {
							background_background: [
									'classic',
							],
							'background_image[url]!': '',
					},
			},
			background_bg_width: {
					name: 'background_bg_width',
					tab: 'style',
					section: 'section_style',
					type: 'slider',
					condition: {
							background_background: [
									'classic',
							],
							background_size: [
									'initial',
							],
							'background_image[url]!': '',
					},
			},
			background_bg_width_widescreen: {
					name: 'background_bg_width_widescreen',
					tab: 'style',
					section: 'section_style',
					type: 'slider',
					condition: {
							background_background: [
									'classic',
							],
							background_size: [
									'initial',
							],
							'background_image[url]!': '',
					},
			},
			background_bg_width_tablet_extra: {
					name: 'background_bg_width_tablet_extra',
					tab: 'style',
					section: 'section_style',
					type: 'slider',
					condition: {
							background_background: [
									'classic',
							],
							background_size: [
									'initial',
							],
							'background_image[url]!': '',
					},
			},
			background_video_link: {
					name: 'background_video_link',
					tab: 'style',
					section: 'section_style',
					type: 'text',
					condition: {
							background_background: [
									'video',
							],
					},
			},
			background_video_start: {
					name: 'background_video_start',
					tab: 'style',
					section: 'section_style',
					type: 'number',
					condition: {
							background_background: [
									'video',
							],
					},
			},
			background_video_end: {
					name: 'background_video_end',
					tab: 'style',
					section: 'section_style',
					type: 'number',
					condition: {
							background_background: [
									'video',
							],
					},
			},
			background_play_once: {
					name: 'background_play_once',
					tab: 'style',
					section: 'section_style',
					type: 'switcher',
					condition: {
							background_background: [
									'video',
							],
					},
			},
			background_privacy_mode: {
					name: 'background_privacy_mode',
					tab: 'style',
					section: 'section_style',
					type: 'switcher',
					condition: {
							background_background: [
									'video',
							],
					},
			},
			background_video_fallback: {
					name: 'background_video_fallback',
					tab: 'style',
					section: 'section_style',
					type: 'media',
					condition: {
							background_background: [
									'video',
							],
					},
			},
			background_slideshow_gallery: {
					name: 'background_slideshow_gallery',
					tab: 'style',
					section: 'section_style',
					type: 'gallery',
					condition: {
							background_background: [
									'slideshow',
							],
					},
			},
			background_slideshow_loop: {
					name: 'background_slideshow_loop',
					tab: 'style',
					section: 'section_style',
					type: 'switcher',
					condition: {
							background_background: [
									'slideshow',
							],
					},
			},
			background_slideshow_slide_duration: {
					name: 'background_slideshow_slide_duration',
					tab: 'style',
					section: 'section_style',
					type: 'number',
					condition: {
							background_background: [
									'slideshow',
							],
					},
			},
			background_slideshow_slide_transition: {
					name: 'background_slideshow_slide_transition',
					tab: 'style',
					section: 'section_style',
					type: 'select',
					options: {
							fade: 'Fade',
							slide_right: 'Slide Right',
							slide_left: 'Slide Left',
							slide_up: 'Slide Up',
							slide_down: 'Slide Down',
					},
					condition: {
							background_background: [
									'slideshow',
							],
					},
			},
			background_slideshow_transition_duration: {
					name: 'background_slideshow_transition_duration',
					tab: 'style',
					section: 'section_style',
					type: 'number',
					condition: {
							background_background: [
									'slideshow',
							],
					},
			},
			background_slideshow_background_size: {
					name: 'background_slideshow_background_size',
					tab: 'style',
					section: 'section_style',
					type: 'select',
					options: {
							'': 'Default',
							auto: 'Auto',
							cover: 'Cover',
							contain: 'Contain',
					},
					condition: {
							background_background: [
									'slideshow',
							],
					},
			},
			background_slideshow_background_size_widescreen: {
					name: 'background_slideshow_background_size_widescreen',
					tab: 'style',
					section: 'section_style',
					type: 'select',
					options: {
							'': 'Default',
							auto: 'Auto',
							cover: 'Cover',
							contain: 'Contain',
					},
					condition: {
							background_background: [
									'slideshow',
							],
					},
			},
			background_slideshow_background_size_tablet_extra: {
					name: 'background_slideshow_background_size_tablet_extra',
					tab: 'style',
					section: 'section_style',
					type: 'select',
					options: {
							'': 'Default',
							auto: 'Auto',
							cover: 'Cover',
							contain: 'Contain',
					},
					condition: {
							background_background: [
									'slideshow',
							],
					},
			},
			background_slideshow_background_position: {
					name: 'background_slideshow_background_position',
					tab: 'style',
					section: 'section_style',
					type: 'select',
					options: {
							'': 'Default',
							'center center': 'Center Center',
							'center left': 'Center Left',
							'center right': 'Center Right',
							'top center': 'Top Center',
							'top left': 'Top Left',
							'top right': 'Top Right',
							'bottom center': 'Bottom Center',
							'bottom left': 'Bottom Left',
							'bottom right': 'Bottom Right',
					},
					condition: {
							background_background: [
									'slideshow',
							],
					},
			},
			background_slideshow_background_position_widescreen: {
					name: 'background_slideshow_background_position_widescreen',
					tab: 'style',
					section: 'section_style',
					type: 'select',
					options: {
							'': 'Default',
							'center center': 'Center Center',
							'center left': 'Center Left',
							'center right': 'Center Right',
							'top center': 'Top Center',
							'top left': 'Top Left',
							'top right': 'Top Right',
							'bottom center': 'Bottom Center',
							'bottom left': 'Bottom Left',
							'bottom right': 'Bottom Right',
					},
					condition: {
							background_background: [
									'slideshow',
							],
					},
			},
			background_slideshow_background_position_tablet_extra: {
					name: 'background_slideshow_background_position_tablet_extra',
					tab: 'style',
					section: 'section_style',
					type: 'select',
					options: {
							'': 'Default',
							'center center': 'Center Center',
							'center left': 'Center Left',
							'center right': 'Center Right',
							'top center': 'Top Center',
							'top left': 'Top Left',
							'top right': 'Top Right',
							'bottom center': 'Bottom Center',
							'bottom left': 'Bottom Left',
							'bottom right': 'Bottom Right',
					},
					condition: {
							background_background: [
									'slideshow',
							],
					},
			},
			background_slideshow_lazyload: {
					name: 'background_slideshow_lazyload',
					tab: 'style',
					section: 'section_style',
					type: 'switcher',
					condition: {
							background_background: [
									'slideshow',
							],
					},
			},
			background_slideshow_ken_burns: {
					name: 'background_slideshow_ken_burns',
					tab: 'style',
					section: 'section_style',
					type: 'switcher',
					condition: {
							background_background: [
									'slideshow',
							],
					},
			},
			background_slideshow_ken_burns_zoom_direction: {
					name: 'background_slideshow_ken_burns_zoom_direction',
					tab: 'style',
					section: 'section_style',
					type: 'select',
					options: {
							in: 'In',
							out: 'Out',
					},
					condition: {
							background_background: [
									'slideshow',
							],
							'background_slideshow_ken_burns!': '',
					},
			},
			tab_button_hover: {
					name: 'tab_button_hover',
					tab: 'style',
					section: 'section_style',
					type: 'tab',
					condition: [],
			},
			hover_color: {
					name: 'hover_color',
					tab: 'style',
					section: 'section_style',
					type: 'color',
					condition: [],
			},
			button_background_hover_background: {
					name: 'button_background_hover_background',
					tab: 'style',
					section: 'section_style',
					type: 'choose',
					options: {
							classic: {
									title: 'Classic',
									icon: 'eicon-paint-brush',
							},
							gradient: {
									title: 'Gradient',
									icon: 'eicon-barcode',
							},
					},
			},
			button_background_hover_color: {
					name: 'button_background_hover_color',
					tab: 'style',
					section: 'section_style',
					type: 'color',
					condition: {
							button_background_hover_background: [
									'classic',
									'gradient',
							],
					},
			},
			button_background_hover_color_stop: {
					name: 'button_background_hover_color_stop',
					tab: 'style',
					section: 'section_style',
					type: 'slider',
					condition: {
							button_background_hover_background: [
									'gradient',
							],
					},
			},
			button_background_hover_color_b: {
					name: 'button_background_hover_color_b',
					tab: 'style',
					section: 'section_style',
					type: 'color',
					condition: {
							button_background_hover_background: [
									'gradient',
							],
					},
			},
			button_background_hover_color_b_stop: {
					name: 'button_background_hover_color_b_stop',
					tab: 'style',
					section: 'section_style',
					type: 'slider',
					condition: {
							button_background_hover_background: [
									'gradient',
							],
					},
			},
			button_background_hover_gradient_type: {
					name: 'button_background_hover_gradient_type',
					tab: 'style',
					section: 'section_style',
					type: 'select',
					options: {
							linear: 'Linear',
							radial: 'Radial',
					},
					condition: {
							button_background_hover_background: [
									'gradient',
							],
					},
			},
			button_background_hover_gradient_angle: {
					name: 'button_background_hover_gradient_angle',
					tab: 'style',
					section: 'section_style',
					type: 'slider',
					condition: {
							button_background_hover_background: [
									'gradient',
							],
							button_background_hover_gradient_type: 'linear',
					},
			},
			button_background_hover_gradient_position: {
					name: 'button_background_hover_gradient_position',
					tab: 'style',
					section: 'section_style',
					type: 'select',
					options: {
							'center center': 'Center Center',
							'center left': 'Center Left',
							'center right': 'Center Right',
							'top center': 'Top Center',
							'top left': 'Top Left',
							'top right': 'Top Right',
							'bottom center': 'Bottom Center',
							'bottom left': 'Bottom Left',
							'bottom right': 'Bottom Right',
					},
					condition: {
							button_background_hover_background: [
									'gradient',
							],
							button_background_hover_gradient_type: 'radial',
					},
			},
			button_background_hover_position: {
					name: 'button_background_hover_position',
					tab: 'style',
					section: 'section_style',
					type: 'select',
					options: {
							'': 'Default',
							'center center': 'Center Center',
							'center left': 'Center Left',
							'center right': 'Center Right',
							'top center': 'Top Center',
							'top left': 'Top Left',
							'top right': 'Top Right',
							'bottom center': 'Bottom Center',
							'bottom left': 'Bottom Left',
							'bottom right': 'Bottom Right',
							initial: 'Custom',
					},
					condition: {
							button_background_hover_background: [
									'classic',
							],
							'button_background_hover_image[url]!': '',
					},
			},
			button_background_hover_position_widescreen: {
					name: 'button_background_hover_position_widescreen',
					tab: 'style',
					section: 'section_style',
					type: 'select',
					options: {
							'': 'Default',
							'center center': 'Center Center',
							'center left': 'Center Left',
							'center right': 'Center Right',
							'top center': 'Top Center',
							'top left': 'Top Left',
							'top right': 'Top Right',
							'bottom center': 'Bottom Center',
							'bottom left': 'Bottom Left',
							'bottom right': 'Bottom Right',
							initial: 'Custom',
					},
					condition: {
							button_background_hover_background: [
									'classic',
							],
							'button_background_hover_image[url]!': '',
					},
			},
			button_background_hover_position_tablet_extra: {
					name: 'button_background_hover_position_tablet_extra',
					tab: 'style',
					section: 'section_style',
					type: 'select',
					options: {
							'': 'Default',
							'center center': 'Center Center',
							'center left': 'Center Left',
							'center right': 'Center Right',
							'top center': 'Top Center',
							'top left': 'Top Left',
							'top right': 'Top Right',
							'bottom center': 'Bottom Center',
							'bottom left': 'Bottom Left',
							'bottom right': 'Bottom Right',
							initial: 'Custom',
					},
					condition: {
							button_background_hover_background: [
									'classic',
							],
							'button_background_hover_image[url]!': '',
					},
			},
			button_background_hover_xpos: {
					name: 'button_background_hover_xpos',
					tab: 'style',
					section: 'section_style',
					type: 'slider',
					condition: {
							button_background_hover_background: [
									'classic',
							],
							button_background_hover_position: [
									'initial',
							],
							'button_background_hover_image[url]!': '',
					},
			},
			button_background_hover_xpos_widescreen: {
					name: 'button_background_hover_xpos_widescreen',
					tab: 'style',
					section: 'section_style',
					type: 'slider',
					condition: {
							button_background_hover_background: [
									'classic',
							],
							button_background_hover_position: [
									'initial',
							],
							'button_background_hover_image[url]!': '',
					},
			},
			button_background_hover_xpos_tablet_extra: {
					name: 'button_background_hover_xpos_tablet_extra',
					tab: 'style',
					section: 'section_style',
					type: 'slider',
					condition: {
							button_background_hover_background: [
									'classic',
							],
							button_background_hover_position: [
									'initial',
							],
							'button_background_hover_image[url]!': '',
					},
			},
			button_background_hover_ypos: {
					name: 'button_background_hover_ypos',
					tab: 'style',
					section: 'section_style',
					type: 'slider',
					condition: {
							button_background_hover_background: [
									'classic',
							],
							button_background_hover_position: [
									'initial',
							],
							'button_background_hover_image[url]!': '',
					},
			},
			button_background_hover_ypos_widescreen: {
					name: 'button_background_hover_ypos_widescreen',
					tab: 'style',
					section: 'section_style',
					type: 'slider',
					condition: {
							button_background_hover_background: [
									'classic',
							],
							button_background_hover_position: [
									'initial',
							],
							'button_background_hover_image[url]!': '',
					},
			},
			button_background_hover_ypos_tablet_extra: {
					name: 'button_background_hover_ypos_tablet_extra',
					tab: 'style',
					section: 'section_style',
					type: 'slider',
					condition: {
							button_background_hover_background: [
									'classic',
							],
							button_background_hover_position: [
									'initial',
							],
							'button_background_hover_image[url]!': '',
					},
			},
			button_background_hover_attachment: {
					name: 'button_background_hover_attachment',
					tab: 'style',
					section: 'section_style',
					type: 'select',
					options: {
							'': 'Default',
							scroll: 'Scroll',
							fixed: 'Fixed',
					},
					condition: {
							button_background_hover_background: [
									'classic',
							],
							'button_background_hover_image[url]!': '',
					},
			},
			button_background_hover_attachment_alert: {
					name: 'button_background_hover_attachment_alert',
					tab: 'style',
					section: 'section_style',
					type: 'raw_html',
					condition: {
							button_background_hover_background: [
									'classic',
							],
							'button_background_hover_image[url]!': '',
							button_background_hover_attachment: 'fixed',
					},
			},
			button_background_hover_repeat: {
					name: 'button_background_hover_repeat',
					tab: 'style',
					section: 'section_style',
					type: 'select',
					options: {
							'': 'Default',
							'no-repeat': 'No-repeat',
							repeat: 'Repeat',
							'repeat-x': 'Repeat-x',
							'repeat-y': 'Repeat-y',
					},
					condition: {
							button_background_hover_background: [
									'classic',
							],
							'button_background_hover_image[url]!': '',
					},
			},
			button_background_hover_repeat_widescreen: {
					name: 'button_background_hover_repeat_widescreen',
					tab: 'style',
					section: 'section_style',
					type: 'select',
					options: {
							'': 'Default',
							'no-repeat': 'No-repeat',
							repeat: 'Repeat',
							'repeat-x': 'Repeat-x',
							'repeat-y': 'Repeat-y',
					},
					condition: {
							button_background_hover_background: [
									'classic',
							],
							'button_background_hover_image[url]!': '',
					},
			},
			button_background_hover_repeat_tablet_extra: {
					name: 'button_background_hover_repeat_tablet_extra',
					tab: 'style',
					section: 'section_style',
					type: 'select',
					options: {
							'': 'Default',
							'no-repeat': 'No-repeat',
							repeat: 'Repeat',
							'repeat-x': 'Repeat-x',
							'repeat-y': 'Repeat-y',
					},
					condition: {
							button_background_hover_background: [
									'classic',
							],
							'button_background_hover_image[url]!': '',
					},
			},
			button_background_hover_size: {
					name: 'button_background_hover_size',
					tab: 'style',
					section: 'section_style',
					type: 'select',
					options: {
							'': 'Default',
							auto: 'Auto',
							cover: 'Cover',
							contain: 'Contain',
							initial: 'Custom',
					},
					condition: {
							button_background_hover_background: [
									'classic',
							],
							'button_background_hover_image[url]!': '',
					},
			},
			button_background_hover_size_widescreen: {
					name: 'button_background_hover_size_widescreen',
					tab: 'style',
					section: 'section_style',
					type: 'select',
					options: {
							'': 'Default',
							auto: 'Auto',
							cover: 'Cover',
							contain: 'Contain',
							initial: 'Custom',
					},
					condition: {
							button_background_hover_background: [
									'classic',
							],
							'button_background_hover_image[url]!': '',
					},
			},
			button_background_hover_size_tablet_extra: {
					name: 'button_background_hover_size_tablet_extra',
					tab: 'style',
					section: 'section_style',
					type: 'select',
					options: {
							'': 'Default',
							auto: 'Auto',
							cover: 'Cover',
							contain: 'Contain',
							initial: 'Custom',
					},
					condition: {
							button_background_hover_background: [
									'classic',
							],
							'button_background_hover_image[url]!': '',
					},
			},
			button_background_hover_bg_width: {
					name: 'button_background_hover_bg_width',
					tab: 'style',
					section: 'section_style',
					type: 'slider',
					condition: {
							button_background_hover_background: [
									'classic',
							],
							button_background_hover_size: [
									'initial',
							],
							'button_background_hover_image[url]!': '',
					},
			},
			button_background_hover_bg_width_widescreen: {
					name: 'button_background_hover_bg_width_widescreen',
					tab: 'style',
					section: 'section_style',
					type: 'slider',
					condition: {
							button_background_hover_background: [
									'classic',
							],
							button_background_hover_size: [
									'initial',
							],
							'button_background_hover_image[url]!': '',
					},
			},
			button_background_hover_bg_width_tablet_extra: {
					name: 'button_background_hover_bg_width_tablet_extra',
					tab: 'style',
					section: 'section_style',
					type: 'slider',
					condition: {
							button_background_hover_background: [
									'classic',
							],
							button_background_hover_size: [
									'initial',
							],
							'button_background_hover_image[url]!': '',
					},
			},
			button_background_hover_video_link: {
					name: 'button_background_hover_video_link',
					tab: 'style',
					section: 'section_style',
					type: 'text',
					condition: {
							button_background_hover_background: [
									'video',
							],
					},
			},
			button_background_hover_video_start: {
					name: 'button_background_hover_video_start',
					tab: 'style',
					section: 'section_style',
					type: 'number',
					condition: {
							button_background_hover_background: [
									'video',
							],
					},
			},
			button_background_hover_video_end: {
					name: 'button_background_hover_video_end',
					tab: 'style',
					section: 'section_style',
					type: 'number',
					condition: {
							button_background_hover_background: [
									'video',
							],
					},
			},
			button_background_hover_play_once: {
					name: 'button_background_hover_play_once',
					tab: 'style',
					section: 'section_style',
					type: 'switcher',
					condition: {
							button_background_hover_background: [
									'video',
							],
					},
			},
			button_background_hover_privacy_mode: {
					name: 'button_background_hover_privacy_mode',
					tab: 'style',
					section: 'section_style',
					type: 'switcher',
					condition: {
							button_background_hover_background: [
									'video',
							],
					},
			},
			button_background_hover_video_fallback: {
					name: 'button_background_hover_video_fallback',
					tab: 'style',
					section: 'section_style',
					type: 'media',
					condition: {
							button_background_hover_background: [
									'video',
							],
					},
			},
			button_background_hover_slideshow_gallery: {
					name: 'button_background_hover_slideshow_gallery',
					tab: 'style',
					section: 'section_style',
					type: 'gallery',
					condition: {
							button_background_hover_background: [
									'slideshow',
							],
					},
			},
			button_background_hover_slideshow_loop: {
					name: 'button_background_hover_slideshow_loop',
					tab: 'style',
					section: 'section_style',
					type: 'switcher',
					condition: {
							button_background_hover_background: [
									'slideshow',
							],
					},
			},
			button_background_hover_slideshow_slide_duration: {
					name: 'button_background_hover_slideshow_slide_duration',
					tab: 'style',
					section: 'section_style',
					type: 'number',
					condition: {
							button_background_hover_background: [
									'slideshow',
							],
					},
			},
			button_background_hover_slideshow_slide_transition: {
					name: 'button_background_hover_slideshow_slide_transition',
					tab: 'style',
					section: 'section_style',
					type: 'select',
					options: {
							fade: 'Fade',
							slide_right: 'Slide Right',
							slide_left: 'Slide Left',
							slide_up: 'Slide Up',
							slide_down: 'Slide Down',
					},
					condition: {
							button_background_hover_background: [
									'slideshow',
							],
					},
			},
			button_background_hover_slideshow_transition_duration: {
					name: 'button_background_hover_slideshow_transition_duration',
					tab: 'style',
					section: 'section_style',
					type: 'number',
					condition: {
							button_background_hover_background: [
									'slideshow',
							],
					},
			},
			button_background_hover_slideshow_background_size: {
					name: 'button_background_hover_slideshow_background_size',
					tab: 'style',
					section: 'section_style',
					type: 'select',
					options: {
							'': 'Default',
							auto: 'Auto',
							cover: 'Cover',
							contain: 'Contain',
					},
					condition: {
							button_background_hover_background: [
									'slideshow',
							],
					},
			},
			button_background_hover_slideshow_background_size_widescreen: {
					name: 'button_background_hover_slideshow_background_size_widescreen',
					tab: 'style',
					section: 'section_style',
					type: 'select',
					options: {
							'': 'Default',
							auto: 'Auto',
							cover: 'Cover',
							contain: 'Contain',
					},
					condition: {
							button_background_hover_background: [
									'slideshow',
							],
					},
			},
			button_background_hover_slideshow_background_size_tablet_extra: {
					name: 'button_background_hover_slideshow_background_size_tablet_extra',
					tab: 'style',
					section: 'section_style',
					type: 'select',
					options: {
							'': 'Default',
							auto: 'Auto',
							cover: 'Cover',
							contain: 'Contain',
					},
					condition: {
							button_background_hover_background: [
									'slideshow',
							],
					},
			},
			button_background_hover_slideshow_background_position: {
					name: 'button_background_hover_slideshow_background_position',
					tab: 'style',
					section: 'section_style',
					type: 'select',
					options: {
							'': 'Default',
							'center center': 'Center Center',
							'center left': 'Center Left',
							'center right': 'Center Right',
							'top center': 'Top Center',
							'top left': 'Top Left',
							'top right': 'Top Right',
							'bottom center': 'Bottom Center',
							'bottom left': 'Bottom Left',
							'bottom right': 'Bottom Right',
					},
					condition: {
							button_background_hover_background: [
									'slideshow',
							],
					},
			},
			button_background_hover_slideshow_background_position_widescreen: {
					name: 'button_background_hover_slideshow_background_position_widescreen',
					tab: 'style',
					section: 'section_style',
					type: 'select',
					options: {
							'': 'Default',
							'center center': 'Center Center',
							'center left': 'Center Left',
							'center right': 'Center Right',
							'top center': 'Top Center',
							'top left': 'Top Left',
							'top right': 'Top Right',
							'bottom center': 'Bottom Center',
							'bottom left': 'Bottom Left',
							'bottom right': 'Bottom Right',
					},
					condition: {
							button_background_hover_background: [
									'slideshow',
							],
					},
			},
			button_background_hover_slideshow_background_position_tablet_extra: {
					name: 'button_background_hover_slideshow_background_position_tablet_extra',
					tab: 'style',
					section: 'section_style',
					type: 'select',
					options: {
							'': 'Default',
							'center center': 'Center Center',
							'center left': 'Center Left',
							'center right': 'Center Right',
							'top center': 'Top Center',
							'top left': 'Top Left',
							'top right': 'Top Right',
							'bottom center': 'Bottom Center',
							'bottom left': 'Bottom Left',
							'bottom right': 'Bottom Right',
					},
					condition: {
							button_background_hover_background: [
									'slideshow',
							],
					},
			},
			button_background_hover_slideshow_lazyload: {
					name: 'button_background_hover_slideshow_lazyload',
					tab: 'style',
					section: 'section_style',
					type: 'switcher',
					condition: {
							button_background_hover_background: [
									'slideshow',
							],
					},
			},
			button_background_hover_slideshow_ken_burns: {
					name: 'button_background_hover_slideshow_ken_burns',
					tab: 'style',
					section: 'section_style',
					type: 'switcher',
					condition: {
							button_background_hover_background: [
									'slideshow',
							],
					},
			},
			button_background_hover_slideshow_ken_burns_zoom_direction: {
					name: 'button_background_hover_slideshow_ken_burns_zoom_direction',
					tab: 'style',
					section: 'section_style',
					type: 'select',
					options: {
							in: 'In',
							out: 'Out',
					},
					condition: {
							button_background_hover_background: [
									'slideshow',
							],
							'button_background_hover_slideshow_ken_burns!': '',
					},
			},
			button_hover_border_color: {
					name: 'button_hover_border_color',
					tab: 'style',
					section: 'section_style',
					type: 'color',
					condition: [],
			},
			hover_animation: {
					name: 'hover_animation',
					tab: 'style',
					section: 'section_style',
					type: 'hover_animation',
					condition: [],
			},
			border_border: {
					name: 'border_border',
					tab: 'style',
					section: 'section_style',
					type: 'select',
					options: {
							'': 'None',
							solid: 'Solid',
							double: 'Double',
							dotted: 'Dotted',
							dashed: 'Dashed',
							groove: 'Groove',
					},
			},
			border_width: {
					name: 'border_width',
					tab: 'style',
					section: 'section_style',
					type: 'dimensions',
					condition: {
							'border_border!': '',
					},
			},
			border_width_widescreen: {
					name: 'border_width_widescreen',
					tab: 'style',
					section: 'section_style',
					type: 'dimensions',
					condition: {
							'border_border!': '',
					},
			},
			border_width_tablet_extra: {
					name: 'border_width_tablet_extra',
					tab: 'style',
					section: 'section_style',
					type: 'dimensions',
					condition: {
							'border_border!': '',
					},
			},
			border_color: {
					name: 'border_color',
					tab: 'style',
					section: 'section_style',
					type: 'color',
					condition: {
							'border_border!': '',
					},
			},
			border_radius: {
					name: 'border_radius',
					tab: 'style',
					section: 'section_style',
					type: 'dimensions',
					condition: [],
			},
			button_box_shadow_box_shadow_type: {
					name: 'button_box_shadow_box_shadow_type',
					tab: 'style',
					section: 'section_style',
					type: 'popover_toggle',
			},
			button_box_shadow_box_shadow: {
					name: 'button_box_shadow_box_shadow',
					tab: 'style',
					section: 'section_style',
					type: 'box_shadow',
					popover: true,
					condition: {
							'button_box_shadow_box_shadow_type!': '',
					},
			},
			button_box_shadow_box_shadow_position: {
					name: 'button_box_shadow_box_shadow_position',
					tab: 'style',
					section: 'section_style',
					type: 'select',
					options: {
							' ': 'Outline',
							inset: 'Inset',
					},
					popover: true,
					condition: {
							'button_box_shadow_box_shadow_type!': '',
					},
			},
			text_padding: {
					name: 'text_padding',
					tab: 'style',
					section: 'section_style',
					type: 'dimensions',
					condition: [],
			},
			text_padding_widescreen: {
					name: 'text_padding_widescreen',
					tab: 'style',
					section: 'section_style',
					type: 'dimensions',
					condition: [],
			},
			text_padding_tablet_extra: {
					name: 'text_padding_tablet_extra',
					tab: 'style',
					section: 'section_style',
					type: 'dimensions',
					condition: [],
			},
		},
	},
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
			},
			text_stroke_text_stroke_type: {
				name: 'text_stroke_text_stroke_type',
				tab: 'style',
				section: 'section_title_style',
				type: 'popover_toggle',
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
			},
			text_shadow_text_shadow_type: {
				name: 'text_shadow_text_shadow_type',
				tab: 'style',
				section: 'section_style',
				type: 'popover_toggle',
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
			},
			drop_cap_space: {
				name: 'drop_cap_space',
				tab: 'style',
				section: 'section_drop_cap',
				type: 'slider',
				condition: {
					drop_cap: 'yes',
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
			},
		},
	},
};
