<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

return [
	'widget_type' => 'html',
	'expected_supported' => [ 'padding', 'margin' ],
	'expected_unsupported' => [ 'transform', 'animation', 'animation-name', 'filter', '-webkit-mask' ],
	'expected_non_style_keys' => null,
	'expected_inner_aliases' => [],
];
