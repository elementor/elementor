<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Controls of the `gallery` widget that its V3 map references, exported from the live widget
 * so the map can be compiled without the add-on plugin installed.
 */
return [
	'gallery_type' => [ 'type' => 'select', 'default' => 'single', 'options' => [ 'single' => 'single', 'multiple' => 'multiple' ], 'name' => 'gallery_type' ],
	'gallery' => [ 'type' => 'gallery', 'condition' => [ 'gallery_type' => 'single' ], 'dynamic' => [ 'active' => true ], 'name' => 'gallery', 'default' => [] ],
	'gallery_layout' => [ 'type' => 'select', 'default' => 'grid', 'options' => [ 'grid' => 'grid', 'justified' => 'justified', 'masonry' => 'masonry' ], 'name' => 'gallery_layout' ],
	'columns' => [ 'type' => 'number', 'condition' => [ 'gallery_layout!' => 'justified' ], 'default' => 4, 'name' => 'columns' ],
	'columns_mobile' => [ 'type' => 'number', 'condition' => [ 'gallery_layout!' => 'justified' ], 'default' => 1, 'name' => 'columns_mobile' ],
	'aspect_ratio' => [ 'type' => 'select', 'default' => '3:2', 'options' => [ '1:1' => '1:1', '3:2' => '3:2', '4:3' => '4:3', '9:16' => '9:16', '16:9' => '16:9', '21:9' => '21:9' ], 'condition' => [ 'gallery_layout' => 'grid' ], 'name' => 'aspect_ratio' ],
	'link_to' => [ 'type' => 'select', 'default' => 'file', 'options' => [ '' => '', 'file' => 'file', 'custom' => 'custom' ], 'name' => 'link_to' ],
	'url' => [ 'type' => 'url', 'condition' => [ 'link_to' => 'custom' ], 'dynamic' => [ 'active' => true ], 'name' => 'url', 'default' => [ 'url' => '', 'is_external' => '', 'nofollow' => '', 'custom_attributes' => '' ] ],
	'overlay_background' => [ 'type' => 'switcher', 'default' => 'yes', 'name' => 'overlay_background' ],
	'overlay_title' => [ 'type' => 'select', 'default' => '', 'options' => [ '' => '', 'title' => 'title', 'caption' => 'caption', 'alt' => 'alt', 'description' => 'description' ], 'name' => 'overlay_title' ],
	'overlay_description' => [ 'type' => 'select', 'default' => '', 'options' => [ '' => '', 'title' => 'title', 'caption' => 'caption', 'alt' => 'alt', 'description' => 'description' ], 'name' => 'overlay_description' ],
	'image_border_color' => [ 'type' => 'color', 'name' => 'image_border_color', 'default' => '' ],
	'image_border_color_hover' => [ 'type' => 'color', 'name' => 'image_border_color_hover', 'default' => '' ],
	'image_border_width' => [ 'type' => 'slider', 'size_units' => [ 'px', '%', 'em', 'rem', 'vw', 'custom' ], 'name' => 'image_border_width', 'default' => [ 'unit' => 'px', 'size' => '', 'sizes' => [] ] ],
	'image_border_radius' => [ 'type' => 'slider', 'size_units' => [ 'px', '%', 'em', 'rem', 'custom' ], 'name' => 'image_border_radius', 'default' => [ 'unit' => 'px', 'size' => '', 'sizes' => [] ] ],
	'image_border_radius_hover' => [ 'type' => 'slider', 'size_units' => [ 'px', '%', 'em', 'rem', 'custom' ], 'name' => 'image_border_radius_hover', 'default' => [ 'unit' => 'px', 'size' => '', 'sizes' => [] ] ],
	'gap' => [ 'type' => 'slider', 'default' => [ 'unit' => 'px', 'size' => 10, 'sizes' => [] ], 'name' => 'gap' ],
	'gap_mobile' => [ 'type' => 'slider', 'default' => [ 'unit' => 'px', 'size' => 10, 'sizes' => [] ], 'name' => 'gap_mobile' ],
	'overlay_background_color' => [ 'type' => 'color', 'condition' => [ 'overlay_background' => 'yes', 'overlay_background_background' => [ 'classic', 'gradient', 'video' ] ], 'default' => '', 'name' => 'overlay_background_color' ],
	'overlay_background_background' => [ 'type' => 'choose', 'condition' => [ 'overlay_background' => 'yes' ], 'options' => [ 'classic' => 'classic', 'gradient' => 'gradient' ], 'name' => 'overlay_background_background', 'default' => '' ],
	'overlay_background_hover_color' => [ 'type' => 'color', 'condition' => [ 'overlay_background' => 'yes', 'overlay_background_hover_background' => [ 'classic', 'gradient', 'video' ] ], 'default' => 'rgba(0,0,0,0.5)', 'name' => 'overlay_background_hover_color' ],
	'overlay_background_hover_background' => [ 'type' => 'choose', 'condition' => [ 'overlay_background' => 'yes' ], 'options' => [ 'classic' => 'classic', 'gradient' => 'gradient' ], 'default' => 'classic', 'name' => 'overlay_background_hover_background' ],
	'content_padding' => [ 'type' => 'slider', 'size_units' => [ 'px', '%', 'em', 'rem', 'vw', 'custom' ], 'default' => [ 'unit' => 'px', 'size' => 20, 'sizes' => [] ], 'is_responsive' => true, 'name' => 'content_padding' ],
	'title_typography_font_family' => [ 'type' => 'font', 'default' => '', 'condition' => [ 'title_typography_typography!' => '', 'overlay_title!' => '' ], 'name' => 'title_typography_font_family' ],
	'title_typography_typography' => [ 'type' => 'popover_toggle', 'return_value' => 'custom', 'condition' => [ 'overlay_title!' => '' ], 'name' => 'title_typography_typography', 'default' => '' ],
	'title_typography_font_size' => [ 'type' => 'slider', 'size_units' => [ 'px', 'em', 'rem', 'vw', 'custom' ], 'condition' => [ 'title_typography_typography!' => '', 'overlay_title!' => '' ], 'is_responsive' => true, 'name' => 'title_typography_font_size', 'default' => [ 'unit' => 'px', 'size' => '', 'sizes' => [] ] ],
	'title_typography_font_weight' => [ 'type' => 'select', 'default' => '', 'options' => [ '100' => '100', '200' => '200', '300' => '300', '400' => '400', '500' => '500', '600' => '600', '700' => '700', '800' => '800', '900' => '900', '' => '', 'normal' => 'normal', 'bold' => 'bold' ], 'condition' => [ 'title_typography_typography!' => '', 'overlay_title!' => '' ], 'name' => 'title_typography_font_weight' ],
	'title_typography_text_transform' => [ 'type' => 'select', 'default' => '', 'options' => [ '' => '', 'uppercase' => 'uppercase', 'lowercase' => 'lowercase', 'capitalize' => 'capitalize', 'none' => 'none' ], 'condition' => [ 'title_typography_typography!' => '', 'overlay_title!' => '' ], 'name' => 'title_typography_text_transform' ],
	'title_typography_font_style' => [ 'type' => 'select', 'default' => '', 'options' => [ '' => '', 'normal' => 'normal', 'italic' => 'italic', 'oblique' => 'oblique' ], 'condition' => [ 'title_typography_typography!' => '', 'overlay_title!' => '' ], 'name' => 'title_typography_font_style' ],
	'title_typography_text_decoration' => [ 'type' => 'select', 'default' => '', 'options' => [ '' => '', 'underline' => 'underline', 'overline' => 'overline', 'line-through' => 'line-through', 'none' => 'none' ], 'condition' => [ 'title_typography_typography!' => '', 'overlay_title!' => '' ], 'name' => 'title_typography_text_decoration' ],
	'title_typography_line_height' => [ 'type' => 'slider', 'size_units' => [ 'px', 'em', 'rem', 'lh', 'rlh', 'custom' ], 'condition' => [ 'title_typography_typography!' => '', 'overlay_title!' => '' ], 'is_responsive' => true, 'name' => 'title_typography_line_height', 'default' => [ 'unit' => 'px', 'size' => '', 'sizes' => [] ] ],
	'title_typography_letter_spacing' => [ 'type' => 'slider', 'size_units' => [ 'px', 'em', 'rem', 'custom' ], 'condition' => [ 'title_typography_typography!' => '', 'overlay_title!' => '' ], 'is_responsive' => true, 'name' => 'title_typography_letter_spacing', 'default' => [ 'unit' => 'px', 'size' => '', 'sizes' => [] ] ],
	'title_typography_word_spacing' => [ 'type' => 'slider', 'size_units' => [ 'px', 'em', 'rem', 'custom' ], 'condition' => [ 'title_typography_typography!' => '', 'overlay_title!' => '' ], 'is_responsive' => true, 'name' => 'title_typography_word_spacing', 'default' => [ 'unit' => 'px', 'size' => '', 'sizes' => [] ] ],
	'title_color' => [ 'type' => 'color', 'condition' => [ 'overlay_title!' => '' ], 'name' => 'title_color', 'default' => '' ],
	'description_typography_font_family' => [ 'type' => 'font', 'default' => '', 'condition' => [ 'description_typography_typography!' => '', 'overlay_description!' => '' ], 'name' => 'description_typography_font_family' ],
	'description_typography_typography' => [ 'type' => 'popover_toggle', 'return_value' => 'custom', 'condition' => [ 'overlay_description!' => '' ], 'name' => 'description_typography_typography', 'default' => '' ],
	'description_typography_font_size' => [ 'type' => 'slider', 'size_units' => [ 'px', 'em', 'rem', 'vw', 'custom' ], 'condition' => [ 'description_typography_typography!' => '', 'overlay_description!' => '' ], 'is_responsive' => true, 'name' => 'description_typography_font_size', 'default' => [ 'unit' => 'px', 'size' => '', 'sizes' => [] ] ],
	'description_typography_font_weight' => [ 'type' => 'select', 'default' => '', 'options' => [ '100' => '100', '200' => '200', '300' => '300', '400' => '400', '500' => '500', '600' => '600', '700' => '700', '800' => '800', '900' => '900', '' => '', 'normal' => 'normal', 'bold' => 'bold' ], 'condition' => [ 'description_typography_typography!' => '', 'overlay_description!' => '' ], 'name' => 'description_typography_font_weight' ],
	'description_typography_text_transform' => [ 'type' => 'select', 'default' => '', 'options' => [ '' => '', 'uppercase' => 'uppercase', 'lowercase' => 'lowercase', 'capitalize' => 'capitalize', 'none' => 'none' ], 'condition' => [ 'description_typography_typography!' => '', 'overlay_description!' => '' ], 'name' => 'description_typography_text_transform' ],
	'description_typography_font_style' => [ 'type' => 'select', 'default' => '', 'options' => [ '' => '', 'normal' => 'normal', 'italic' => 'italic', 'oblique' => 'oblique' ], 'condition' => [ 'description_typography_typography!' => '', 'overlay_description!' => '' ], 'name' => 'description_typography_font_style' ],
	'description_typography_text_decoration' => [ 'type' => 'select', 'default' => '', 'options' => [ '' => '', 'underline' => 'underline', 'overline' => 'overline', 'line-through' => 'line-through', 'none' => 'none' ], 'condition' => [ 'description_typography_typography!' => '', 'overlay_description!' => '' ], 'name' => 'description_typography_text_decoration' ],
	'description_typography_line_height' => [ 'type' => 'slider', 'size_units' => [ 'px', 'em', 'rem', 'lh', 'rlh', 'custom' ], 'condition' => [ 'description_typography_typography!' => '', 'overlay_description!' => '' ], 'is_responsive' => true, 'name' => 'description_typography_line_height', 'default' => [ 'unit' => 'px', 'size' => '', 'sizes' => [] ] ],
	'description_typography_letter_spacing' => [ 'type' => 'slider', 'size_units' => [ 'px', 'em', 'rem', 'custom' ], 'condition' => [ 'description_typography_typography!' => '', 'overlay_description!' => '' ], 'is_responsive' => true, 'name' => 'description_typography_letter_spacing', 'default' => [ 'unit' => 'px', 'size' => '', 'sizes' => [] ] ],
	'description_typography_word_spacing' => [ 'type' => 'slider', 'size_units' => [ 'px', 'em', 'rem', 'custom' ], 'condition' => [ 'description_typography_typography!' => '', 'overlay_description!' => '' ], 'is_responsive' => true, 'name' => 'description_typography_word_spacing', 'default' => [ 'unit' => 'px', 'size' => '', 'sizes' => [] ] ],
	'description_color' => [ 'type' => 'color', 'condition' => [ 'overlay_description!' => '' ], 'name' => 'description_color', 'default' => '' ],
];
