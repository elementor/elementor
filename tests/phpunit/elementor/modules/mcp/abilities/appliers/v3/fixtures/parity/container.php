<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

return [
	'widget_type' => 'container',
	'expected_supported' => [ 'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left', 'background-color', 'background-color@hover', 'flex-direction', 'flex-wrap', 'justify-content', 'align-items', 'align-content', 'gap', 'display', 'border-style', 'border-color', 'border-width', 'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width', 'border-radius', 'border-top', 'border-right', 'border-bottom', 'border-left', 'border', 'min-height', 'max-width', 'position', 'z-index', 'overflow', 'flex-grow', 'flex-shrink', 'align-self', 'order' ],
	'expected_unsupported' => [ 'transform', 'animation', 'animation-name', 'filter', '-webkit-mask' ],
	'expected_non_style_keys' => [ '_element_id' ],
	'expected_inner_aliases' => [],
];
