<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes\Html;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Html\Html_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Html_V2_Prop_Type extends Object_Prop_Type {
	public static function get_key(): string {
		return 'html-v2';
	}

	protected function define_shape(): array {
		return [
			'content' => String_Prop_Type::make(),
		];
	}

	protected function validate_value( $value ): bool {
		if ( ! is_array( $value ) ) {
			return false;
		}

		if ( ! array_key_exists( 'content', $value ) ) {
			return false;
		}

		if ( ! is_null( $value['content'] ) && ! is_string( $value['content'] ) ) {
			return false;
		}

		if ( ! array_key_exists( 'children', $value ) ) {
			return false;
		}

		if ( ! is_array( $value['children'] ) ) {
			return false;
		}

		return true;
	}

	public function sanitize_value( $value ) {
		if ( is_string( $value['content'] ) ) {
			$value['content'] = $this->sanitize_html_content( $value['content'] );
		}

		$value['children'] = $this->sanitize_children( $value['children'] );

		return $value;
	}

	private function sanitize_html_content( string $content ): string {
		return preg_replace_callback( '/^(\s*)(.*?)(\s*)$/', function ( $matches ) {
			[, $leading, $value, $trailing ] = $matches;

			$sanitized = wp_kses( $value, self::get_allowed_tags() );

			return $leading . $sanitized . $trailing;
		}, $content );
	}

	private static function get_allowed_tags(): array {
		$base_tags = Html_Prop_Type::get_base_allowed_tags();

		$inline_tags = [ 'b', 'i', 'em', 'u', 'a', 'del', 'span', 'strong', 'sup', 'sub', 's' ];

		foreach ( $inline_tags as $tag ) {
			if ( isset( $base_tags[ $tag ] ) ) {
				$base_tags[ $tag ]['id'] = true;
			}
		}

		return $base_tags;
	}

	private function sanitize_children( array $children ): array {
		$sanitized = [];

		foreach ( $children as $child ) {
			if ( ! is_array( $child ) ) {
				continue;
			}

			$sanitized_child = [];

			if ( isset( $child['id'] ) && is_string( $child['id'] ) ) {
				$sanitized_child['id'] = sanitize_text_field( $child['id'] );
			}

			if ( isset( $child['type'] ) && is_string( $child['type'] ) ) {
				$sanitized_child['type'] = sanitize_text_field( $child['type'] );
			}

			if ( isset( $child['content'] ) && is_string( $child['content'] ) ) {
				$sanitized_child['content'] = sanitize_text_field( $child['content'] );
			}

			if ( isset( $child['children'] ) && is_array( $child['children'] ) ) {
				$sanitized_child['children'] = $this->sanitize_children( $child['children'] );
			}

			$sanitized[] = $sanitized_child;
		}

		return $sanitized;
	}
}
