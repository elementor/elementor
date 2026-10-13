<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

return [
	'carousel_name' => [ 'type' => 'text', 'default' => 'Image Carousel' ],
	'navigation' => [ 'type' => 'select', 'options' => [ 'both' => 'both', 'arrows' => 'arrows', 'dots' => 'dots', 'none' => 'none' ] ],
	'image_stretch' => [ 'type' => 'select', 'options' => [ 'no' => 'no', 'yes' => 'yes' ] ],
	'slides_to_show' => [ 'type' => 'select', 'options' => [ '' => '', '1' => '1', '2' => '2', '3' => '3' ] ],
	'image_spacing' => [ 'type' => 'select', 'options' => [ '' => '', 'custom' => 'custom' ] ],
	'image_border_radius' => [ 'type' => 'dimensions', 'size_units' => [ 'px' ], 'is_responsive' => true ],
	'arrows_color' => [ 'type' => 'color' ],
	'dots_color' => [ 'type' => 'color' ],
];
