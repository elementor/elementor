<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

return [
	'widget_type' => 'icon-box',
	'description' => 'V3 icon-box (icon + title + description composite). Exposed only when the V4 atomic experiment is off; when V4 is on, compose `e-svg`, `e-heading`, and `e-paragraph` inside an `e-flexbox` instead.',
];
