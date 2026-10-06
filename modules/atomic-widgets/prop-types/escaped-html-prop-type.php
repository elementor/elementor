<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Escaped_Html_Prop_Type extends Html_Prop_Type {
	const BUTTON_TEXT_TAGS = [ 'b', 'strong', 'sup', 'sub', 's', 'em', 'i', 'u', 'del', 'span', 'br' ];

	const HEADING_TEXT_TAGS = [ 'b', 'strong', 'sup', 'sub', 's', 'em', 'i', 'u', 'a', 'del', 'span', 'br' ];

	const PARAGRAPH_TEXT_TAGS = [ 'b', 'strong', 'sup', 'sub', 's', 'em', 'u', 'ul', 'ol', 'li', 'blockquote', 'a', 'del', 'span', 'br' ];

	public static function get_key(): string {
		return 'escaped-html';
	}

	public static function get_allowed_html_tags_for_prop( string $widget_type, string $prop_key ): ?array {
		$map = [
			'e-button' => [
				'text' => self::BUTTON_TEXT_TAGS,
			],
			'e-heading' => [
				'title' => self::HEADING_TEXT_TAGS,
			],
			'e-paragraph' => [
				'paragraph' => self::PARAGRAPH_TEXT_TAGS,
			],
		];

		return $map[ $widget_type ][ $prop_key ] ?? null;
	}
}
