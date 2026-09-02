<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

return [
	'widget_type' => 'image',
	'description' => 'V3 image. Exposed only when the V4 atomic experiment is off; when V4 is on, use `e-image` instead.',
];
