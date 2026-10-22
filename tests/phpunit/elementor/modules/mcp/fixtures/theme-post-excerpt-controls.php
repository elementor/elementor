<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Controls of the `theme-post-excerpt` widget that its V3 map references, exported from the live widget
 * so the map can be compiled without the add-on plugin installed.
 */
return [
	'excerpt' => [ 'type' => 'text', 'dynamic' => [ 'active' => true ], 'name' => 'excerpt', 'default' => '' ],
	'align' => [ 'type' => 'choose', 'options' => [ 'start' => 'start', 'center' => 'center', 'end' => 'end', 'justify' => 'justify' ], 'is_responsive' => true, 'name' => 'align', 'default' => '' ],
	'typography_typography' => [ 'type' => 'popover_toggle', 'return_value' => 'custom', 'name' => 'typography_typography', 'default' => '' ],
	'typography_font_family' => [ 'type' => 'font', 'default' => '', 'condition' => [ 'typography_typography!' => '' ], 'name' => 'typography_font_family' ],
	'typography_font_size' => [ 'type' => 'slider', 'size_units' => [ 'px', 'em', 'rem', 'vw', 'custom' ], 'condition' => [ 'typography_typography!' => '' ], 'is_responsive' => true, 'name' => 'typography_font_size', 'default' => [ 'unit' => 'px', 'size' => '', 'sizes' => [] ] ],
	'typography_font_weight' => [ 'type' => 'select', 'default' => '', 'options' => [ 100 => '100', 200 => '200', 300 => '300', 400 => '400', 500 => '500', 600 => '600', 700 => '700', 800 => '800', 900 => '900', '' => '', 'normal' => 'normal', 'bold' => 'bold' ], 'condition' => [ 'typography_typography!' => '' ], 'name' => 'typography_font_weight' ],
	'typography_text_transform' => [ 'type' => 'select', 'default' => '', 'options' => [ '' => '', 'uppercase' => 'uppercase', 'lowercase' => 'lowercase', 'capitalize' => 'capitalize', 'none' => 'none' ], 'condition' => [ 'typography_typography!' => '' ], 'name' => 'typography_text_transform' ],
	'typography_font_style' => [ 'type' => 'select', 'default' => '', 'options' => [ '' => '', 'normal' => 'normal', 'italic' => 'italic', 'oblique' => 'oblique' ], 'condition' => [ 'typography_typography!' => '' ], 'name' => 'typography_font_style' ],
	'typography_text_decoration' => [ 'type' => 'select', 'default' => '', 'options' => [ '' => '', 'underline' => 'underline', 'overline' => 'overline', 'line-through' => 'line-through', 'none' => 'none' ], 'condition' => [ 'typography_typography!' => '' ], 'name' => 'typography_text_decoration' ],
	'typography_line_height' => [ 'type' => 'slider', 'size_units' => [ 'px', 'em', 'rem', 'lh', 'rlh', 'custom' ], 'condition' => [ 'typography_typography!' => '' ], 'is_responsive' => true, 'name' => 'typography_line_height', 'default' => [ 'unit' => 'px', 'size' => '', 'sizes' => [] ] ],
	'typography_letter_spacing' => [ 'type' => 'slider', 'size_units' => [ 'px', 'em', 'rem', 'custom' ], 'condition' => [ 'typography_typography!' => '' ], 'is_responsive' => true, 'name' => 'typography_letter_spacing', 'default' => [ 'unit' => 'px', 'size' => '', 'sizes' => [] ] ],
	'typography_word_spacing' => [ 'type' => 'slider', 'size_units' => [ 'px', 'em', 'rem', 'custom' ], 'condition' => [ 'typography_typography!' => '' ], 'is_responsive' => true, 'name' => 'typography_word_spacing', 'default' => [ 'unit' => 'px', 'size' => '', 'sizes' => [] ] ],
	'title_color' => [ 'type' => 'color', 'name' => 'title_color', 'default' => '' ],
	'link_color' => [ 'type' => 'color', 'name' => 'link_color', 'default' => '' ],
	'link_hover_color' => [ 'type' => 'color', 'name' => 'link_hover_color', 'default' => '' ],
];
