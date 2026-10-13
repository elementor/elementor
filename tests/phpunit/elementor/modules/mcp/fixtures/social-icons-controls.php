<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

return [
	'shape' => [
		'type' => 'select',
		'options' => [ 'square' => 'square', 'rounded' => 'rounded', 'circle' => 'circle' ],
		'default' => 'rounded',
	],
	'columns' => [
		'type' => 'select',
		'options' => [ '0' => '0', '1' => '1', '2' => '2', '3' => '3' ],
		'default' => '0',
	],
	'align' => [ 'type' => 'choose', 'default' => 'center' ],
	'icon_color' => [ 'type' => 'select', 'options' => [ 'default' => 'default', 'custom' => 'custom' ] ],
	'icon_primary_color' => [ 'type' => 'color' ],
	'icon_secondary_color' => [ 'type' => 'color' ],
	'icon_size' => [ 'type' => 'slider', 'size_units' => [ 'px' ] ],
	'icon_padding' => [ 'type' => 'slider', 'size_units' => [ 'em' ] ],
	'icon_spacing' => [ 'type' => 'slider', 'size_units' => [ 'px' ] ],
];
