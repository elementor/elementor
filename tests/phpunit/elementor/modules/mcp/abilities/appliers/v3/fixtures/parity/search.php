<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

return [
	'widget_type' => 'search',
	'expected_supported' => [ 'color', 'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left', 'font-family', 'font-size', 'font-weight', 'line-height', 'letter-spacing', 'background-color', 'border-radius' ],
	'expected_unsupported' => [ 'transform', 'animation', 'animation-name', 'filter', '-webkit-mask' ],
	'expected_non_style_keys' => null,
	'expected_inner_aliases' => [ 'search-field', 'submit-button' ],
];
