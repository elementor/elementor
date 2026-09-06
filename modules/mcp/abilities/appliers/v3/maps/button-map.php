<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

return [
	'widget_type' => 'button',
	'description' => 'V3 button. Exposed only when the V4 atomic experiment is off; when V4 is on, use `e-button` instead.',
];
