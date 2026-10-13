<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

return [
	'title' => [ 'type' => 'text', 'default' => 'My Skill' ],
	'title_tag' => [ 'type' => 'select', 'options' => [ 'span' => 'span', 'div' => 'div' ] ],
	'title_display' => [ 'type' => 'switcher', 'default' => 'yes' ],
	'percent' => [ 'type' => 'slider', 'default' => [ 'size' => 50, 'unit' => '%' ] ],
	'display_percentage' => [ 'type' => 'switcher', 'return_value' => 'show', 'default' => 'show' ],
	'inner_text' => [ 'type' => 'text', 'default' => 'Web Designer' ],
	'title_color' => [ 'type' => 'color' ],
	'typography_typography' => [ 'type' => 'typography' ],
	'typography_font_size' => [ 'type' => 'slider', 'size_units' => [ 'px' ] ],
	'bar_color' => [ 'type' => 'color' ],
	'bar_bg_color' => [ 'type' => 'color' ],
	'bar_height' => [ 'type' => 'slider', 'size_units' => [ 'px' ] ],
	'bar_border_radius' => [ 'type' => 'slider', 'size_units' => [ 'px' ] ],
	'bar_inline_color' => [ 'type' => 'color' ],
	'bar_inner_typography_typography' => [ 'type' => 'typography' ],
	'bar_inner_typography_font_size' => [ 'type' => 'slider', 'size_units' => [ 'px' ] ],
];
