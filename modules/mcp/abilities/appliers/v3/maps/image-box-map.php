<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

return [
	'widget_type' => 'image-box',
	'description' => 'V3 image-box (image + title + description composite). Exposed only when the V4 atomic experiment is off; when V4 is on, compose `e-image`, `e-heading`, and `e-paragraph` inside an `e-flexbox` instead.',
];
