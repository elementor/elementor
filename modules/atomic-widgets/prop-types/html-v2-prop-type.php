<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Html_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Html_V2_Prop_Type extends Html_Prop_Type {
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

		[ $content, $children ] = $this->extract_value_parts( $value );

		if ( ! is_string( $content ) ) {
			return false;
		}

		return null === $children
			? true
			: $this->validate_children( $children );
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

		[ $content, $children ] = $this->extract_value_parts( $value );

		$content = is_string( $content )
			? $this->sanitize_html( $content )
			: '';

		$children = $this->sanitize_children( $children );

		return [
			'content' => $content,
			'children' => $children,
		];
	}

	private function validate_child( $child ): bool {
		if ( ! $this->get_child_base( $child ) ) {
			return false;
		}

		if ( isset( $child['content'] ) && ! is_string( $child['content'] ) ) {
			return false;
		}

		$children = $child['children'] ?? null;

		return null === $children
			? true
			: $this->validate_children( $children );
	}

	private function validate_children( $children ): bool {
		if ( ! is_array( $children ) ) {
			return false;
		}

		foreach ( $children as $child ) {
			if ( ! $this->validate_child( $child ) ) {
				return false;
			}
		}

		return true;
	}

	private function sanitize_child( $child ): ?array {
		$base = $this->get_child_base( $child );
		if ( ! $base ) {
			return null;
		}

		$node = [
			'id' => sanitize_text_field( $base['id'] ),
			'type' => sanitize_text_field( $base['type'] ),
		];

		if ( isset( $child['content'] ) && is_string( $child['content'] ) ) {
			$node['content'] = $this->sanitize_html( $child['content'] );
		}

		if ( array_key_exists( 'children', $child ) ) {
			$node['children'] = $this->sanitize_children( $child['children'] );
		}

		return $node;
	}

	private function sanitize_children( $children ): array {
		if ( ! is_array( $children ) ) {
			return [];
		}

		$sanitized_children = [];
		foreach ( $children as $child ) {
			$sanitized = $this->sanitize_child( $child );
			if ( null !== $sanitized ) {
				$sanitized_children[] = $sanitized;
			}
		}

		return $sanitized_children;
	}

	private function get_child_base( $child ): ?array {
		if ( ! is_array( $child ) ) {
			return null;
		}

		if ( ! isset( $child['id'] ) || ! is_string( $child['id'] ) || '' === $child['id'] ) {
			return null;
		}

		if ( ! isset( $child['type'] ) || ! is_string( $child['type'] ) || '' === $child['type'] ) {
			return null;
		}

		return [
			'id' => $child['id'],
			'type' => $child['type'],
		];
	}

	private function extract_value_parts( array $value ): array {
		if ( array_key_exists( 'content', $value ) ) {
			return [ $value['content'] ?? null, $value['children'] ?? null ];
		}

		if ( array_key_exists( 0, $value ) ) {
			return [ $value[0] ?? null, $value[1] ?? null ];
		}

		return [ null, null ];
	}
}
