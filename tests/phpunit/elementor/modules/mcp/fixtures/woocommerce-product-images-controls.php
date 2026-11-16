<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Controls of the `woocommerce-product-images` widget that its V3 map references, exported from the live widget
 * so the map can be compiled without the add-on plugin installed.
 */
return [
	'sale_flash' => [ 'type' => 'switcher', 'return_value' => 'yes', 'default' => 'yes', 'name' => 'sale_flash' ],
	'image_border_border' => [ 'type' => 'select', 'options' => [ '' => '', 'none' => 'none', 'solid' => 'solid', 'double' => 'double', 'dotted' => 'dotted', 'dashed' => 'dashed', 'groove' => 'groove' ], 'name' => 'image_border_border', 'default' => '' ],
	'image_border_width' => [ 'type' => 'dimensions', 'size_units' => [ 'px', 'em', 'rem', 'vw', 'custom' ], 'condition' => [ 'image_border_border!' => [ '', 'none' ] ], 'is_responsive' => true, 'name' => 'image_border_width', 'default' => [ 'unit' => 'px', 'top' => '', 'right' => '', 'bottom' => '', 'left' => '', 'isLinked' => true ] ],
	'image_border_color' => [ 'type' => 'color', 'default' => '', 'condition' => [ 'image_border_border!' => [ '', 'none' ] ], 'name' => 'image_border_color' ],
	'image_border_radius' => [ 'type' => 'dimensions', 'size_units' => [ 'px', '%', 'em', 'rem', 'custom' ], 'is_responsive' => true, 'name' => 'image_border_radius', 'default' => [ 'unit' => 'px', 'top' => '', 'right' => '', 'bottom' => '', 'left' => '', 'isLinked' => true ] ],
	'spacing' => [ 'type' => 'slider', 'size_units' => [ 'px', 'em', 'rem', 'custom' ], 'name' => 'spacing', 'default' => [ 'unit' => 'px', 'size' => '', 'sizes' => [] ] ],
	'thumbs_border_border' => [ 'type' => 'select', 'options' => [ '' => '', 'none' => 'none', 'solid' => 'solid', 'double' => 'double', 'dotted' => 'dotted', 'dashed' => 'dashed', 'groove' => 'groove' ], 'name' => 'thumbs_border_border', 'default' => '' ],
	'thumbs_border_width' => [ 'type' => 'dimensions', 'size_units' => [ 'px', 'em', 'rem', 'vw', 'custom' ], 'condition' => [ 'thumbs_border_border!' => [ '', 'none' ] ], 'is_responsive' => true, 'name' => 'thumbs_border_width', 'default' => [ 'unit' => 'px', 'top' => '', 'right' => '', 'bottom' => '', 'left' => '', 'isLinked' => true ] ],
	'thumbs_border_color' => [ 'type' => 'color', 'default' => '', 'condition' => [ 'thumbs_border_border!' => [ '', 'none' ] ], 'name' => 'thumbs_border_color' ],
	'thumbs_border_radius' => [ 'type' => 'dimensions', 'size_units' => [ 'px', '%', 'em', 'rem', 'custom' ], 'is_responsive' => true, 'name' => 'thumbs_border_radius', 'default' => [ 'unit' => 'px', 'top' => '', 'right' => '', 'bottom' => '', 'left' => '', 'isLinked' => true ] ],
];
