<?php

namespace Elementor\Modules\DesignSystemSync\Classes;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Sync_Typography_Props {
	const PROP_MAP = [
		'font-family' => 'typography_font_family',
		'font-size' => 'typography_font_size',
		'font-weight' => 'typography_font_weight',
		'font-style' => 'typography_font_style',
		'text-decoration' => 'typography_text_decoration',
		'line-height' => 'typography_line_height',
		'letter-spacing' => 'typography_letter_spacing',
		'word-spacing' => 'typography_word_spacing',
		'text-transform' => 'typography_text_transform',
	];

	const RESPONSIVE_V3_PROPS = [
		'typography_font_size',
		'typography_line_height',
		'typography_letter_spacing',
		'typography_word_spacing',
	];

	public static function get_css_props(): array {
		return array_keys( self::PROP_MAP );
	}
}
