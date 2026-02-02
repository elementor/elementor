<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Html_V2_Prop_Type extends String_Prop_Type {
	public static function get_key(): string {
		return 'html-v2';
	}

	protected function validate_value( $value ): bool {
		if ( is_string( $value ) ) {
			return true;
		}

		if ( ! is_array( $value ) ) {
			return false;
		}

		if ( ! array_key_exists( 'content', $value ) || ! is_string( $value['content'] ) ) {
			return false;
		}

		if ( isset( $value['children'] ) && ! is_array( $value['children'] ) ) {
			return false;
		}

		if ( isset( $value['children'] ) ) {
			foreach ( $value['children'] as $child ) {
				if ( ! $this->validate_child( $child ) ) {
					return false;
				}
			}
		}

		return true;
	}

	protected function sanitize_value( $value ) {
		if ( is_string( $value ) ) {
			return [
				'content' => $this->sanitize_html( $value ),
				'children' => [],
			];
		}

		if ( ! is_array( $value ) ) {
			return [
				'content' => '',
				'children' => [],
			];
		}

		$content = is_string( $value['content'] ?? null )
			? $this->sanitize_html( $value['content'] )
			: '';

		$children = [];
		if ( isset( $value['children'] ) && is_array( $value['children'] ) ) {
			foreach ( $value['children'] as $child ) {
				$sanitized = $this->sanitize_child( $child );
				if ( null !== $sanitized ) {
					$children[] = $sanitized;
				}
			}
		}

		return [
			'content' => $content,
			'children' => $children,
		];
	}

	private function validate_child( $child ): bool {
		if ( ! is_array( $child ) ) {
			return false;
		}

		if ( empty( $child['id'] ) || ! is_string( $child['id'] ) ) {
			return false;
		}

		if ( empty( $child['type'] ) || ! is_string( $child['type'] ) ) {
			return false;
		}

		if ( isset( $child['content'] ) && ! is_string( $child['content'] ) ) {
			return false;
		}

		if ( isset( $child['children'] ) ) {
			if ( ! is_array( $child['children'] ) ) {
				return false;
			}

			foreach ( $child['children'] as $nested_child ) {
				if ( ! $this->validate_child( $nested_child ) ) {
					return false;
				}
			}
		}

		return true;
	}

	private function sanitize_child( $child ): ?array {
		if ( ! is_array( $child ) ) {
			return null;
		}

		if ( empty( $child['id'] ) || ! is_string( $child['id'] ) ) {
			return null;
		}

		if ( empty( $child['type'] ) || ! is_string( $child['type'] ) ) {
			return null;
		}

		$node = [
			'id' => sanitize_text_field( $child['id'] ),
			'type' => sanitize_text_field( $child['type'] ),
		];

		if ( isset( $child['content'] ) && is_string( $child['content'] ) ) {
			$node['content'] = $this->sanitize_html( $child['content'] );
		}

		if ( isset( $child['children'] ) && is_array( $child['children'] ) ) {
			$node_children = [];
			foreach ( $child['children'] as $nested_child ) {
				$sanitized_child = $this->sanitize_child( $nested_child );
				if ( null !== $sanitized_child ) {
					$node_children[] = $sanitized_child;
				}
			}
			$node['children'] = $node_children;
		}

		return $node;
	}

	private function sanitize_html( string $value ): string {
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
