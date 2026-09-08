<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

return [
	'widget_type' => 'theme-archive-title',
	'expected_supported' => [ 'color', 'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left', 'font-family', 'font-size', 'font-weight', 'line-height', 'letter-spacing' ],
	'expected_unsupported' => [ 'transform', 'animation', 'animation-name', 'filter', '-webkit-mask' ],
	'expected_non_style_keys' => [ 'title', 'link', 'size', 'header_size', '_element_id' ],
	'expected_inner_aliases' => [],
];
