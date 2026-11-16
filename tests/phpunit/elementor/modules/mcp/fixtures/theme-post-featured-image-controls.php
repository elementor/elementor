<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Controls of the `theme-post-featured-image` widget that its V3 map references, exported from the live widget
 * so the map can be compiled without the add-on plugin installed.
 */
return [
	'image' => [ 'type' => 'media', 'dynamic' => [ 'active' => true ], 'default' => [ 'url' => 'assets/images/placeholder.png', 'id' => '', 'size' => '' ], 'name' => 'image' ],
	'image_size' => [ 'type' => 'select', 'options' => [ 'thumbnail' => 'thumbnail', 'medium' => 'medium', 'medium_large' => 'medium_large', 'large' => 'large', '1536x1536' => '1536x1536', '2048x2048' => '2048x2048', 'woocommerce_thumbnail' => 'woocommerce_thumbnail', 'woocommerce_single' => 'woocommerce_single', 'woocommerce_gallery_thumbnail' => 'woocommerce_gallery_thumbnail', 'full' => 'full', 'custom' => 'custom' ], 'default' => 'large', 'condition' => [ 'image[url]!' => '' ], 'name' => 'image_size' ],
	'caption_source' => [ 'type' => 'select', 'options' => [ 'none' => 'none', 'attachment' => 'attachment', 'custom' => 'custom' ], 'default' => 'none', 'condition' => [ 'image[url]!' => '' ], 'name' => 'caption_source' ],
	'caption' => [ 'type' => 'text', 'default' => '', 'condition' => [ 'image[url]!' => '', 'caption_source' => 'custom' ], 'dynamic' => [ 'active' => true ], 'name' => 'caption' ],
	'link_to' => [ 'type' => 'select', 'default' => 'none', 'options' => [ 'none' => 'none', 'file' => 'file', 'custom' => 'custom' ], 'condition' => [ 'image[url]!' => '' ], 'name' => 'link_to' ],
	'link' => [ 'type' => 'url', 'dynamic' => [ 'active' => true ], 'condition' => [ 'image[url]!' => '', 'link_to' => 'custom' ], 'name' => 'link', 'default' => [ 'url' => '', 'is_external' => '', 'nofollow' => '', 'custom_attributes' => '' ] ],
	'open_lightbox' => [ 'type' => 'select', 'default' => 'default', 'options' => [ 'default' => 'default', 'yes' => 'yes', 'no' => 'no' ], 'condition' => [ 'image[url]!' => '', 'link_to' => 'file' ], 'name' => 'open_lightbox' ],
	'align' => [ 'type' => 'choose', 'options' => [ 'start' => 'start', 'center' => 'center', 'end' => 'end' ], 'is_responsive' => true, 'name' => 'align', 'default' => '' ],
	'width' => [ 'type' => 'slider', 'default' => [ 'unit' => '%', 'size' => '', 'sizes' => [] ], 'size_units' => [ 'px', '%', 'em', 'rem', 'vw', 'custom' ], 'is_responsive' => true, 'name' => 'width' ],
	'space' => [ 'type' => 'slider', 'default' => [ 'unit' => '%', 'size' => '', 'sizes' => [] ], 'size_units' => [ 'px', '%', 'em', 'rem', 'vw', 'custom' ], 'is_responsive' => true, 'name' => 'space' ],
	'height' => [ 'type' => 'slider', 'size_units' => [ 'px', '%', 'em', 'rem', 'vh', 'custom' ], 'is_responsive' => true, 'name' => 'height', 'default' => [ 'unit' => 'px', 'size' => '', 'sizes' => [] ] ],
	'object-fit' => [ 'type' => 'select', 'condition' => [ 'height[size]!' => '' ], 'options' => [ '' => '', 'fill' => 'fill', 'cover' => 'cover', 'contain' => 'contain', 'scale-down' => 'scale-down' ], 'default' => '', 'is_responsive' => true, 'name' => 'object-fit' ],
	'image_border_border' => [ 'type' => 'select', 'options' => [ '' => '', 'none' => 'none', 'solid' => 'solid', 'double' => 'double', 'dotted' => 'dotted', 'dashed' => 'dashed', 'groove' => 'groove' ], 'name' => 'image_border_border', 'default' => '' ],
	'image_border_width' => [ 'type' => 'dimensions', 'size_units' => [ 'px', 'em', 'rem', 'vw', 'custom' ], 'condition' => [ 'image_border_border!' => [ '', 'none' ] ], 'is_responsive' => true, 'name' => 'image_border_width', 'default' => [ 'unit' => 'px', 'top' => '', 'right' => '', 'bottom' => '', 'left' => '', 'isLinked' => true ] ],
	'image_border_color' => [ 'type' => 'color', 'default' => '', 'condition' => [ 'image_border_border!' => [ '', 'none' ] ], 'name' => 'image_border_color' ],
	'image_border_radius' => [ 'type' => 'dimensions', 'size_units' => [ 'px', '%', 'em', 'rem', 'custom' ], 'is_responsive' => true, 'name' => 'image_border_radius', 'default' => [ 'unit' => 'px', 'top' => '', 'right' => '', 'bottom' => '', 'left' => '', 'isLinked' => true ] ],
	'image_box_shadow_box_shadow_type' => [ 'type' => 'popover_toggle', 'return_value' => 'yes', 'name' => 'image_box_shadow_box_shadow_type', 'default' => '' ],
	'image_box_shadow_box_shadow' => [ 'type' => 'box_shadow', 'condition' => [ 'image_box_shadow_box_shadow_type!' => '' ], 'name' => 'image_box_shadow_box_shadow', 'default' => [ 'horizontal' => 0, 'vertical' => 0, 'blur' => 10, 'spread' => 0, 'color' => 'rgba(0,0,0,0.5)' ] ],
	'caption_align' => [ 'type' => 'choose', 'condition' => [ 'image[url]!' => '', 'caption_source!' => 'none' ], 'options' => [ 'start' => 'start', 'center' => 'center', 'end' => 'end', 'justify' => 'justify' ], 'default' => '', 'is_responsive' => true, 'name' => 'caption_align' ],
	'text_color' => [ 'type' => 'color', 'condition' => [ 'image[url]!' => '', 'caption_source!' => 'none' ], 'default' => '', 'name' => 'text_color' ],
	'caption_background_color' => [ 'type' => 'color', 'condition' => [ 'image[url]!' => '', 'caption_source!' => 'none' ], 'name' => 'caption_background_color', 'default' => '' ],
	'caption_typography_typography' => [ 'type' => 'popover_toggle', 'condition' => [ 'image[url]!' => '', 'caption_source!' => 'none' ], 'return_value' => 'custom', 'name' => 'caption_typography_typography', 'default' => '' ],
	'caption_typography_font_family' => [ 'type' => 'font', 'condition' => [ 'image[url]!' => '', 'caption_source!' => 'none', 'caption_typography_typography!' => '' ], 'default' => '', 'name' => 'caption_typography_font_family' ],
	'caption_typography_font_size' => [ 'type' => 'slider', 'condition' => [ 'image[url]!' => '', 'caption_source!' => 'none', 'caption_typography_typography!' => '' ], 'size_units' => [ 'px', 'em', 'rem', 'vw', 'custom' ], 'is_responsive' => true, 'name' => 'caption_typography_font_size', 'default' => [ 'unit' => 'px', 'size' => '', 'sizes' => [] ] ],
	'caption_typography_font_weight' => [ 'type' => 'select', 'condition' => [ 'image[url]!' => '', 'caption_source!' => 'none', 'caption_typography_typography!' => '' ], 'default' => '', 'options' => [ 100 => '100', 200 => '200', 300 => '300', 400 => '400', 500 => '500', 600 => '600', 700 => '700', 800 => '800', 900 => '900', '' => '', 'normal' => 'normal', 'bold' => 'bold' ], 'name' => 'caption_typography_font_weight' ],
	'caption_typography_text_transform' => [ 'type' => 'select', 'condition' => [ 'image[url]!' => '', 'caption_source!' => 'none', 'caption_typography_typography!' => '' ], 'default' => '', 'options' => [ '' => '', 'uppercase' => 'uppercase', 'lowercase' => 'lowercase', 'capitalize' => 'capitalize', 'none' => 'none' ], 'name' => 'caption_typography_text_transform' ],
	'caption_typography_font_style' => [ 'type' => 'select', 'condition' => [ 'image[url]!' => '', 'caption_source!' => 'none', 'caption_typography_typography!' => '' ], 'default' => '', 'options' => [ '' => '', 'normal' => 'normal', 'italic' => 'italic', 'oblique' => 'oblique' ], 'name' => 'caption_typography_font_style' ],
	'caption_typography_text_decoration' => [ 'type' => 'select', 'condition' => [ 'image[url]!' => '', 'caption_source!' => 'none', 'caption_typography_typography!' => '' ], 'default' => '', 'options' => [ '' => '', 'underline' => 'underline', 'overline' => 'overline', 'line-through' => 'line-through', 'none' => 'none' ], 'name' => 'caption_typography_text_decoration' ],
	'caption_typography_line_height' => [ 'type' => 'slider', 'condition' => [ 'image[url]!' => '', 'caption_source!' => 'none', 'caption_typography_typography!' => '' ], 'size_units' => [ 'px', 'em', 'rem', 'lh', 'rlh', 'custom' ], 'is_responsive' => true, 'name' => 'caption_typography_line_height', 'default' => [ 'unit' => 'px', 'size' => '', 'sizes' => [] ] ],
	'caption_typography_letter_spacing' => [ 'type' => 'slider', 'condition' => [ 'image[url]!' => '', 'caption_source!' => 'none', 'caption_typography_typography!' => '' ], 'size_units' => [ 'px', 'em', 'rem', 'custom' ], 'is_responsive' => true, 'name' => 'caption_typography_letter_spacing', 'default' => [ 'unit' => 'px', 'size' => '', 'sizes' => [] ] ],
	'caption_typography_word_spacing' => [ 'type' => 'slider', 'condition' => [ 'image[url]!' => '', 'caption_source!' => 'none', 'caption_typography_typography!' => '' ], 'size_units' => [ 'px', 'em', 'rem', 'custom' ], 'is_responsive' => true, 'name' => 'caption_typography_word_spacing', 'default' => [ 'unit' => 'px', 'size' => '', 'sizes' => [] ] ],
	'caption_space' => [ 'type' => 'slider', 'condition' => [ 'image[url]!' => '', 'caption_source!' => 'none' ], 'size_units' => [ 'px', 'em', 'rem', 'custom' ], 'is_responsive' => true, 'name' => 'caption_space', 'default' => [ 'unit' => 'px', 'size' => '', 'sizes' => [] ] ],
];
