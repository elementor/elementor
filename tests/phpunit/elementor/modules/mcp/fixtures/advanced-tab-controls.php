<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Advanced-tab controls that the shared `wrapper` style target binds, exported from the live
 * common widget so maps can be compiled without the add-on plugins installed.
 */
return [
	'_background_background' => [ 'type' => 'choose', 'options' => [ 'classic' => 'classic', 'gradient' => 'gradient' ], 'name' => '_background_background', 'default' => '' ],
	'_background_color' => [ 'type' => 'color', 'default' => '', 'condition' => [ '_background_background' => [ 'classic', 'gradient', 'video' ] ], 'name' => '_background_color' ],
	'_background_hover_background' => [ 'type' => 'choose', 'options' => [ 'classic' => 'classic', 'gradient' => 'gradient' ], 'name' => '_background_hover_background', 'default' => '' ],
	'_background_hover_color' => [ 'type' => 'color', 'default' => '', 'condition' => [ '_background_hover_background' => [ 'classic', 'gradient', 'video' ] ], 'name' => '_background_hover_color' ],
	'_border_border' => [ 'type' => 'select', 'options' => [ '' => '', 'none' => 'none', 'solid' => 'solid', 'double' => 'double', 'dotted' => 'dotted', 'dashed' => 'dashed', 'groove' => 'groove' ], 'name' => '_border_border', 'default' => '' ],
	'_border_color' => [ 'type' => 'color', 'default' => '', 'condition' => [ '_border_border!' => [ '', 'none' ] ], 'name' => '_border_color' ],
	'_border_hover_border' => [ 'type' => 'select', 'options' => [ '' => '', 'none' => 'none', 'solid' => 'solid', 'double' => 'double', 'dotted' => 'dotted', 'dashed' => 'dashed', 'groove' => 'groove' ], 'name' => '_border_hover_border', 'default' => '' ],
	'_border_hover_color' => [ 'type' => 'color', 'default' => '', 'condition' => [ '_border_hover_border!' => [ '', 'none' ] ], 'name' => '_border_hover_color' ],
	'_border_hover_width' => [ 'type' => 'dimensions', 'size_units' => [ 'px', 'em', 'rem', 'vw', 'custom' ], 'condition' => [ '_border_hover_border!' => [ '', 'none' ] ], 'is_responsive' => true, 'name' => '_border_hover_width', 'default' => [ 'unit' => 'px', 'top' => '', 'right' => '', 'bottom' => '', 'left' => '', 'isLinked' => true ] ],
	'_border_radius' => [ 'type' => 'dimensions', 'size_units' => [ 'px', '%', 'em', 'rem', 'custom' ], 'is_responsive' => true, 'name' => '_border_radius', 'default' => [ 'unit' => 'px', 'top' => '', 'right' => '', 'bottom' => '', 'left' => '', 'isLinked' => true ] ],
	'_border_radius_hover' => [ 'type' => 'dimensions', 'size_units' => [ 'px', '%', 'em', 'rem', 'custom' ], 'is_responsive' => true, 'name' => '_border_radius_hover', 'default' => [ 'unit' => 'px', 'top' => '', 'right' => '', 'bottom' => '', 'left' => '', 'isLinked' => true ] ],
	'_border_width' => [ 'type' => 'dimensions', 'size_units' => [ 'px', 'em', 'rem', 'vw', 'custom' ], 'condition' => [ '_border_border!' => [ '', 'none' ] ], 'is_responsive' => true, 'name' => '_border_width', 'default' => [ 'unit' => 'px', 'top' => '', 'right' => '', 'bottom' => '', 'left' => '', 'isLinked' => true ] ],
	'_box_shadow_box_shadow' => [ 'type' => 'box_shadow', 'condition' => [ '_box_shadow_box_shadow_type!' => '' ], 'name' => '_box_shadow_box_shadow', 'default' => [ 'horizontal' => 0, 'vertical' => 0, 'blur' => 10, 'spread' => 0, 'color' => 'rgba(0,0,0,0.5)' ] ],
	'_box_shadow_box_shadow_type' => [ 'type' => 'popover_toggle', 'return_value' => 'yes', 'name' => '_box_shadow_box_shadow_type', 'default' => '' ],
	'_box_shadow_hover_box_shadow' => [ 'type' => 'box_shadow', 'condition' => [ '_box_shadow_hover_box_shadow_type!' => '' ], 'name' => '_box_shadow_hover_box_shadow', 'default' => [ 'horizontal' => 0, 'vertical' => 0, 'blur' => 10, 'spread' => 0, 'color' => 'rgba(0,0,0,0.5)' ] ],
	'_box_shadow_hover_box_shadow_type' => [ 'type' => 'popover_toggle', 'return_value' => 'yes', 'name' => '_box_shadow_hover_box_shadow_type', 'default' => '' ],
	'_element_custom_width' => [ 'type' => 'slider', 'size_units' => [ 'px', '%', 'em', 'rem', 'vw', 'custom' ], 'default' => [ 'unit' => '%', 'size' => '', 'sizes' => [] ], 'condition' => [ '_element_width' => 'initial' ], 'is_responsive' => true, 'name' => '_element_custom_width' ],
	'_element_width' => [ 'type' => 'select', 'options' => [ '' => '', 'inherit' => 'inherit', 'auto' => 'auto', 'initial' => 'initial' ], 'default' => '', 'name' => '_element_width' ],
	'_element_width_mobile' => [ 'type' => 'select', 'options' => [ '' => '', 'inherit' => 'inherit', 'auto' => 'auto', 'initial' => 'initial' ], 'name' => '_element_width_mobile', 'default' => '' ],
	'_flex_align_self' => [ 'type' => 'choose', 'options' => [ 'flex-start' => 'flex-start', 'center' => 'center', 'flex-end' => 'flex-end', 'stretch' => 'stretch' ], 'default' => '', 'is_responsive' => true, 'name' => '_flex_align_self' ],
	'_flex_grow' => [ 'type' => 'number', 'default' => 1, 'condition' => [ '_flex_size' => 'custom' ], 'is_responsive' => true, 'name' => '_flex_grow' ],
	'_flex_shrink' => [ 'type' => 'number', 'default' => 1, 'condition' => [ '_flex_size' => 'custom' ], 'is_responsive' => true, 'name' => '_flex_shrink' ],
	'_flex_size' => [ 'type' => 'choose', 'default' => '', 'options' => [ 'none' => 'none', 'grow' => 'grow', 'shrink' => 'shrink', 'custom' => 'custom' ], 'is_responsive' => true, 'name' => '_flex_size' ],
	'_margin' => [ 'type' => 'dimensions', 'size_units' => [ 'px', '%', 'em', 'rem', 'vw', 'custom' ], 'is_responsive' => true, 'name' => '_margin', 'default' => [ 'unit' => 'px', 'top' => '', 'right' => '', 'bottom' => '', 'left' => '', 'isLinked' => true ] ],
	'_offset_orientation_h' => [ 'type' => 'choose', 'default' => 'start', 'options' => [ 'start' => 'start', 'end' => 'end' ], 'condition' => [ '_position!' => '' ], 'name' => '_offset_orientation_h' ],
	'_offset_orientation_v' => [ 'type' => 'choose', 'default' => 'start', 'options' => [ 'start' => 'start', 'end' => 'end' ], 'condition' => [ '_position!' => '' ], 'name' => '_offset_orientation_v' ],
	'_offset_x' => [ 'type' => 'slider', 'default' => [ 'unit' => 'px', 'size' => 0, 'sizes' => [] ], 'size_units' => [ 'px', '%', 'em', 'rem', 'vw', 'vh', 'custom' ], 'condition' => [ '_offset_orientation_h!' => 'end', '_position!' => '' ], 'is_responsive' => true, 'name' => '_offset_x' ],
	'_offset_x_end' => [ 'type' => 'slider', 'default' => [ 'unit' => 'px', 'size' => 0, 'sizes' => [] ], 'size_units' => [ 'px', '%', 'em', 'rem', 'vw', 'vh', 'custom' ], 'condition' => [ '_offset_orientation_h' => 'end', '_position!' => '' ], 'is_responsive' => true, 'name' => '_offset_x_end' ],
	'_offset_y' => [ 'type' => 'slider', 'size_units' => [ 'px', '%', 'em', 'rem', 'vh', 'vw', 'custom' ], 'default' => [ 'unit' => 'px', 'size' => 0, 'sizes' => [] ], 'condition' => [ '_offset_orientation_v!' => 'end', '_position!' => '' ], 'is_responsive' => true, 'name' => '_offset_y' ],
	'_offset_y_end' => [ 'type' => 'slider', 'size_units' => [ 'px', '%', 'em', 'rem', 'vh', 'vw', 'custom' ], 'default' => [ 'unit' => 'px', 'size' => 0, 'sizes' => [] ], 'condition' => [ '_offset_orientation_v' => 'end', '_position!' => '' ], 'is_responsive' => true, 'name' => '_offset_y_end' ],
	'_padding' => [ 'type' => 'dimensions', 'size_units' => [ 'px', '%', 'em', 'rem', 'vw', 'custom' ], 'is_responsive' => true, 'name' => '_padding', 'default' => [ 'unit' => 'px', 'top' => '', 'right' => '', 'bottom' => '', 'left' => '', 'isLinked' => true ] ],
	'_position' => [ 'type' => 'select', 'default' => '', 'options' => [ '' => '', 'absolute' => 'absolute', 'fixed' => 'fixed' ], 'name' => '_position' ],
	'_z_index' => [ 'type' => 'number', 'is_responsive' => true, 'name' => '_z_index', 'default' => '' ],
];
