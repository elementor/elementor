<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

return [
	'widget_type' => 'video',
	'expected_supported' => [ 'width', 'max-width', 'padding', 'margin', 'border-radius' ],
	'expected_unsupported' => [ 'transform', 'animation', 'animation-name', 'filter', '-webkit-mask' ],
	'expected_non_style_keys' => null,
	'expected_inner_aliases' => [],
];
