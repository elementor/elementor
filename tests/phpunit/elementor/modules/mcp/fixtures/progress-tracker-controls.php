<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Controls of the `progress-tracker` widget that its V3 map references, exported from the live widget
 * so the map can be compiled without the add-on plugin installed.
 */
return [
	'type' => [ 'type' => 'select', 'options' => [ 'horizontal' => 'horizontal', 'circular' => 'circular' ], 'default' => 'horizontal', 'name' => 'type' ],
	'relative_to' => [ 'type' => 'select', 'options' => [ 'entire_page' => 'entire_page', 'post_content' => 'post_content', 'selector' => 'selector' ], 'default' => 'entire_page', 'name' => 'relative_to' ],
	'selector' => [ 'type' => 'text', 'condition' => [ 'relative_to' => 'selector' ], 'name' => 'selector', 'default' => '' ],
	'percentage' => [ 'type' => 'switcher', 'default' => 'no', 'name' => 'percentage' ],
	'horizontal_color_color' => [ 'type' => 'color', 'default' => '', 'condition' => [ 'horizontal_color_background' => [ 'classic', 'gradient', 'video' ], 'type' => 'horizontal' ], 'name' => 'horizontal_color_color' ],
	'horizontal_color_background' => [ 'type' => 'choose', 'options' => [ 'classic' => 'classic', 'gradient' => 'gradient' ], 'condition' => [ 'type' => 'horizontal' ], 'name' => 'horizontal_color_background', 'default' => '' ],
	'horizontal_border_style' => [ 'type' => 'select', 'default' => 'none', 'options' => [ 'none' => 'none', 'solid' => 'solid', 'double' => 'double', 'dotted' => 'dotted', 'dashed' => 'dashed', 'groove' => 'groove' ], 'condition' => [ 'type' => 'horizontal' ], 'name' => 'horizontal_border_style' ],
	'horizontal_border_width' => [ 'type' => 'dimensions', 'size_units' => [ 'px', '%', 'em', 'rem', 'vw', 'custom' ], 'condition' => [ 'horizontal_border_style!' => 'none', 'type' => 'horizontal' ], 'is_responsive' => true, 'name' => 'horizontal_border_width', 'default' => [ 'unit' => 'px', 'top' => '', 'right' => '', 'bottom' => '', 'left' => '', 'isLinked' => true ] ],
	'horizontal_border_color' => [ 'type' => 'color', 'condition' => [ 'horizontal_border_style!' => 'none', 'type' => 'horizontal' ], 'name' => 'horizontal_border_color', 'default' => '' ],
	'horizontal_border_radius' => [ 'type' => 'dimensions', 'size_units' => [ 'px', '%', 'em', 'rem', 'custom' ], 'condition' => [ 'type' => 'horizontal' ], 'is_responsive' => true, 'name' => 'horizontal_border_radius', 'default' => [ 'unit' => 'px', 'top' => '', 'right' => '', 'bottom' => '', 'left' => '', 'isLinked' => true ] ],
	'box_shadow_box_shadow' => [ 'type' => 'box_shadow', 'condition' => [ 'box_shadow_box_shadow_type!' => '', 'type' => 'horizontal' ], 'name' => 'box_shadow_box_shadow', 'default' => [ 'horizontal' => 0, 'vertical' => 0, 'blur' => 10, 'spread' => 0, 'color' => 'rgba(0,0,0,0.5)' ] ],
	'box_shadow_box_shadow_type' => [ 'type' => 'popover_toggle', 'return_value' => 'yes', 'condition' => [ 'type' => 'horizontal' ], 'name' => 'box_shadow_box_shadow_type', 'default' => '' ],
	'horizontal_background_color_color' => [ 'type' => 'color', 'default' => '', 'condition' => [ 'horizontal_background_color_background' => [ 'classic', 'gradient', 'video' ], 'type' => 'horizontal' ], 'name' => 'horizontal_background_color_color' ],
	'horizontal_background_color_background' => [ 'type' => 'choose', 'options' => [ 'classic' => 'classic', 'gradient' => 'gradient' ], 'condition' => [ 'type' => 'horizontal' ], 'name' => 'horizontal_background_color_background', 'default' => '' ],
	'horizontal_height' => [ 'type' => 'slider', 'size_units' => [ 'px', 'em', 'rem', 'vh', 'custom' ], 'condition' => [ 'type' => 'horizontal' ], 'is_responsive' => true, 'name' => 'horizontal_height', 'default' => [ 'unit' => 'px', 'size' => '', 'sizes' => [] ] ],
	'horizontal_padding' => [ 'type' => 'dimensions', 'size_units' => [ 'px', '%', 'em', 'rem', 'vw', 'custom' ], 'condition' => [ 'type' => 'horizontal' ], 'is_responsive' => true, 'name' => 'horizontal_padding', 'default' => [ 'unit' => 'px', 'top' => '', 'right' => '', 'bottom' => '', 'left' => '', 'isLinked' => true ] ],
	'horizontal_tracker_border_style' => [ 'type' => 'select', 'default' => 'none', 'options' => [ 'none' => 'none', 'solid' => 'solid', 'double' => 'double', 'dotted' => 'dotted', 'dashed' => 'dashed', 'groove' => 'groove' ], 'condition' => [ 'type' => 'horizontal' ], 'name' => 'horizontal_tracker_border_style' ],
	'horizontal_tracker_border_width' => [ 'type' => 'dimensions', 'size_units' => [ 'px', '%', 'em', 'rem', 'vw', 'custom' ], 'condition' => [ 'horizontal_tracker_border_style!' => 'none', 'type' => 'horizontal' ], 'is_responsive' => true, 'name' => 'horizontal_tracker_border_width', 'default' => [ 'unit' => 'px', 'top' => '', 'right' => '', 'bottom' => '', 'left' => '', 'isLinked' => true ] ],
	'horizontal_tracker_border_color' => [ 'type' => 'color', 'condition' => [ 'horizontal_tracker_border_style!' => 'none', 'type' => 'horizontal' ], 'name' => 'horizontal_tracker_border_color', 'default' => '' ],
	'horizontal_tracker_border_radius' => [ 'type' => 'dimensions', 'size_units' => [ 'px', '%', 'em', 'rem', 'custom' ], 'condition' => [ 'type' => 'horizontal' ], 'is_responsive' => true, 'name' => 'horizontal_tracker_border_radius', 'default' => [ 'unit' => 'px', 'top' => '', 'right' => '', 'bottom' => '', 'left' => '', 'isLinked' => true ] ],
	'circular_size' => [ 'type' => 'slider', 'size_units' => [ 'px', 'em', 'rem', 'custom' ], 'condition' => [ 'type' => 'circular' ], 'is_responsive' => true, 'name' => 'circular_size', 'default' => [ 'unit' => 'px', 'size' => '', 'sizes' => [] ] ],
	'circular_color' => [ 'type' => 'color', 'condition' => [ 'type' => 'circular' ], 'name' => 'circular_color', 'default' => '' ],
	'circular_background_color' => [ 'type' => 'color', 'condition' => [ 'type' => 'circular' ], 'name' => 'circular_background_color', 'default' => '' ],
	'percentage_typography_font_family' => [ 'type' => 'font', 'condition' => [ 'percentage' => 'yes', 'percentage_typography_typography!' => '' ], 'default' => '', 'name' => 'percentage_typography_font_family' ],
	'percentage_typography_typography' => [ 'type' => 'popover_toggle', 'condition' => [ 'percentage' => 'yes' ], 'return_value' => 'custom', 'name' => 'percentage_typography_typography', 'default' => '' ],
	'percentage_typography_font_size' => [ 'type' => 'slider', 'condition' => [ 'percentage' => 'yes', 'percentage_typography_typography!' => '' ], 'size_units' => [ 'px', 'em', 'rem', 'vw', 'custom' ], 'is_responsive' => true, 'name' => 'percentage_typography_font_size', 'default' => [ 'unit' => 'px', 'size' => '', 'sizes' => [] ] ],
	'percentage_typography_font_weight' => [ 'type' => 'select', 'condition' => [ 'percentage' => 'yes', 'percentage_typography_typography!' => '' ], 'default' => '', 'options' => [ '100' => '100', '200' => '200', '300' => '300', '400' => '400', '500' => '500', '600' => '600', '700' => '700', '800' => '800', '900' => '900', '' => '', 'normal' => 'normal', 'bold' => 'bold' ], 'name' => 'percentage_typography_font_weight' ],
	'percentage_typography_text_transform' => [ 'type' => 'select', 'condition' => [ 'percentage' => 'yes', 'percentage_typography_typography!' => '' ], 'default' => '', 'options' => [ '' => '', 'uppercase' => 'uppercase', 'lowercase' => 'lowercase', 'capitalize' => 'capitalize', 'none' => 'none' ], 'name' => 'percentage_typography_text_transform' ],
	'percentage_typography_font_style' => [ 'type' => 'select', 'condition' => [ 'percentage' => 'yes', 'percentage_typography_typography!' => '' ], 'default' => '', 'options' => [ '' => '', 'normal' => 'normal', 'italic' => 'italic', 'oblique' => 'oblique' ], 'name' => 'percentage_typography_font_style' ],
	'percentage_typography_text_decoration' => [ 'type' => 'select', 'condition' => [ 'percentage' => 'yes', 'percentage_typography_typography!' => '' ], 'default' => '', 'options' => [ '' => '', 'underline' => 'underline', 'overline' => 'overline', 'line-through' => 'line-through', 'none' => 'none' ], 'name' => 'percentage_typography_text_decoration' ],
	'percentage_typography_line_height' => [ 'type' => 'slider', 'condition' => [ 'percentage' => 'yes', 'percentage_typography_typography!' => '' ], 'size_units' => [ 'px', 'em', 'rem', 'lh', 'rlh', 'custom' ], 'is_responsive' => true, 'name' => 'percentage_typography_line_height', 'default' => [ 'unit' => 'px', 'size' => '', 'sizes' => [] ] ],
	'percentage_typography_letter_spacing' => [ 'type' => 'slider', 'condition' => [ 'percentage' => 'yes', 'percentage_typography_typography!' => '' ], 'size_units' => [ 'px', 'em', 'rem', 'custom' ], 'is_responsive' => true, 'name' => 'percentage_typography_letter_spacing', 'default' => [ 'unit' => 'px', 'size' => '', 'sizes' => [] ] ],
	'percentage_typography_word_spacing' => [ 'type' => 'slider', 'condition' => [ 'percentage' => 'yes', 'percentage_typography_typography!' => '' ], 'size_units' => [ 'px', 'em', 'rem', 'custom' ], 'is_responsive' => true, 'name' => 'percentage_typography_word_spacing', 'default' => [ 'unit' => 'px', 'size' => '', 'sizes' => [] ] ],
	'percentage_color' => [ 'type' => 'color', 'condition' => [ 'percentage' => 'yes' ], 'name' => 'percentage_color', 'default' => '' ],
];
