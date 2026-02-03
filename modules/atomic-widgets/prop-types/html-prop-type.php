<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Html_Prop_Type extends String_Prop_Type {
	public static function get_key(): string {
		return 'html';
	}

	protected function validate_value( $value ): bool {
		return is_string( $value );
	}

	protected function sanitize_value( $value ) {
		return $this->sanitize_html( $value );
	}

	protected function sanitize_html( string $value ): string {
		return preg_replace_callback( '/^(\s*)(.*?)(\s*)$/', function ( $matches ) {
			[, $leading, $sanitizing, $trailing ] = $matches;

			$allowed_tags = [
				'b' => [],
				'i' => [],
				'em' => [],
				'u' => [],
				'ul' => [],
				'ol' => [],
				'li' => [],
				'blockquote' => [],
				'a' => [
					'href' => true,
					'target' => true,
				],
				'del' => [],
				'span' => [],
				'br' => [],
				'strong' => [],
				'sup' => [],
				'sub' => [],
				's' => [],
			];

			$sanitized = wp_kses( $sanitizing, $allowed_tags );

			return $leading . $sanitized . $trailing;
		}, $value );
	}
}
