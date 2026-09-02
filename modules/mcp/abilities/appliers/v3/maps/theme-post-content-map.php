<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

return [
	'widget_type' => 'theme-post-content',
	'description' => 'Single-template body slot only. Exactly one per single template, wrapped in an `e-div-block`. Do NOT place inside loop items, archives, headers, footers, or components — the loop already repeats the article body.',
];
