<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

return [
	'starting_number' => [
		'type' => 'number',
		'default' => 0,
	],
	'ending_number' => [
		'type' => 'number',
		'default' => 100,
	],
	'prefix' => [
		'type' => 'text',
		'default' => '',
	],
	'suffix' => [
		'type' => 'text',
		'default' => '',
	],
	'duration' => [
		'type' => 'number',
		'default' => 2000,
	],
	'thousand_separator' => [
		'type' => 'switcher',
		'default' => 'yes',
	],
	'thousand_separator_char' => [
		'type' => 'select',
		'options' => [
			'' => 'Default',
			'.' => 'Dot',
		],
	],
	'title' => [
		'type' => 'text',
		'default' => 'Cool Number',
	],
	'title_tag' => [
		'type' => 'select',
		'options' => [
			'h1' => 'H1',
			'h2' => 'H2',
			'div' => 'div',
			'span' => 'span',
		],
		'default' => 'div',
	],
	'number_color' => [
		'type' => 'color',
	],
	'title_color' => [
		'type' => 'color',
	],
	'typography_number_typography' => [
		'type' => 'typography',
	],
	'typography_number_font_size' => [
		'type' => 'slider',
		'size_units' => [ 'px', 'em', 'rem' ],
	],
	'typography_number_font_weight' => [
		'type' => 'select',
	],
	'typography_title_typography' => [
		'type' => 'typography',
	],
	'typography_title_font_size' => [
		'type' => 'slider',
		'size_units' => [ 'px', 'em', 'rem' ],
	],
];
