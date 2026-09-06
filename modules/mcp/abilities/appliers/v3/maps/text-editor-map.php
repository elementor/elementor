<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

return [
	'widget_type' => 'text-editor',
	'description' => 'V3 rich-text editor. Exposed only when the V4 atomic experiment is off; when V4 is on, use `e-paragraph` instead.',
];
