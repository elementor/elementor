<?php

namespace Elementor\Modules\GlobalClasses\Classes;

use Elementor\Modules\AtomicWidgets\Styles\Size_Constants;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Global_Class_Css_Renderer {

	public static function make(): self {
		return new self();
	}

	public function render( array $items, array $order ): string {
		$blocks = [];

		foreach ( $order as $id ) {
			if ( ! isset( $items[ $id ] ) ) {
				continue;
			}

			$rendered = $this->render_class( $items[ $id ] );

			if ( '' !== $rendered ) {
				$blocks[] = $rendered;
			}
		}

		return implode( "\n\n", $blocks );
	}

	private function render_class( array $item ): string {
		$label = $item['label'] ?? '';

		if ( '' === $label ) {
			return '';
		}

		$variants = $item['variants'] ?? [];
		$desktop_variant = $this->find_desktop_variant( $variants );

		if ( null === $desktop_variant ) {
			return '';
		}

		$declarations = array_merge(
			$this->render_props( $desktop_variant['props'] ?? [] ),
			$this->render_custom_css( $desktop_variant['custom_css'] ?? null )
		);

		if ( empty( $declarations ) ) {
			return '';
		}

		$body = implode( "\n  ", $declarations );

		return ".{$label} {\n  {$body}\n}";
	}

	private function find_desktop_variant( array $variants ): ?array {
		foreach ( $variants as $variant ) {
			$meta = $variant['meta'] ?? [];
			$state = $meta['state'] ?? null;
			$breakpoint = $meta['breakpoint'] ?? 'desktop';

			if ( null === $state && 'desktop' === $breakpoint ) {
				return $variant;
			}
		}

		return null;
	}

	private function render_props( array $props ): array {
		$declarations = [];

		foreach ( $props as $property => $prop ) {
			$rendered_value = $this->render_prop_value( $prop );

			if ( null !== $rendered_value ) {
				$declarations[] = $property . ': ' . $rendered_value . ';';
			}
		}

		return $declarations;
	}

	private function render_prop_value( $prop ): ?string {
		if ( ! is_array( $prop ) || ! isset( $prop['$$type'] ) ) {
			return null;
		}

		switch ( $prop['$$type'] ) {
			case 'color':
				return is_string( $prop['value'] ?? null ) ? $prop['value'] : null;

			case 'size':
				return $this->render_size( $prop['value'] ?? null );
		}

		return null;
	}

	private function render_size( $value ): ?string {
		if ( ! is_array( $value ) || ! isset( $value['unit'] ) ) {
			return null;
		}

		$unit = $value['unit'];
		$size = $value['size'] ?? null;

		if ( Size_Constants::UNIT_AUTO === $unit ) {
			return 'auto';
		}

		if ( Size_Constants::UNIT_CUSTOM === $unit ) {
			return is_string( $size ) ? $size : null;
		}

		if ( ! is_numeric( $size ) ) {
			return null;
		}

		return $size . $unit;
	}

	private function render_custom_css( $custom_css ): array {
		if ( ! is_array( $custom_css ) || empty( $custom_css['raw'] ) ) {
			return [];
		}

		$decoded = Utils::decode_string( $custom_css['raw'], '' );

		if ( '' === $decoded ) {
			return [];
		}

		return array_map( 'trim', explode( "\n", $decoded ) );
	}
}
