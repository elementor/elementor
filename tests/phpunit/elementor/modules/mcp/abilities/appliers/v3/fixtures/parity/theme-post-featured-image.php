<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

return [
	'widget_type' => 'theme-post-featured-image',
	'expected_supported' => [ 'width', 'max-width', 'border-radius' ],
	'expected_unsupported' => [ 'transform', 'animation', 'animation-name', 'filter', '-webkit-mask' ],
	'expected_non_style_keys' => [ 'image', 'image_size', 'image_custom_dimension', 'caption_source', 'caption', 'link_to', 'link', 'open_lightbox', '_element_id' ],
	'expected_inner_aliases' => [],
];
