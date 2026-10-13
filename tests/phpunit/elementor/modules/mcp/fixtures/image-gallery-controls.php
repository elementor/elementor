<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

return [
	'gallery_columns' => [ 'type' => 'select', 'options' => [ '1' => '1', '2' => '2', '3' => '3', '4' => '4' ] ],
	'gallery_link' => [ 'type' => 'select', 'options' => [ 'file' => 'file', 'attachment' => 'attachment', 'none' => 'none' ] ],
	'gallery_display_caption' => [ 'type' => 'select', 'options' => [ 'none' => 'none', '' => '' ] ],
	'open_lightbox' => [ 'type' => 'select', 'options' => [ 'default' => 'default', 'yes' => 'yes', 'no' => 'no' ] ],
	'gallery_rand' => [ 'type' => 'select', 'options' => [ '' => '', 'rand' => 'rand' ] ],
	'image_spacing' => [ 'type' => 'select', 'options' => [ '' => '', 'custom' => 'custom' ] ],
	'image_spacing_custom' => [ 'type' => 'slider', 'size_units' => [ 'px' ], 'is_responsive' => true ],
	'image_border_radius' => [ 'type' => 'dimensions', 'size_units' => [ 'px' ], 'is_responsive' => true ],
	'text_color' => [ 'type' => 'color' ],
];
