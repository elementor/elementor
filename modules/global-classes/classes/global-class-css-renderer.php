<?php

namespace Elementor\Modules\GlobalClasses\Classes;

use Elementor\Modules\AtomicWidgets\Styles\Size_Constants;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Global_Class_Css_Renderer {

	private const DIMENSIONS_TO_PHYSICAL = [
		'margin' => [
			'block-start' => 'margin-top',
			'inline-end' => 'margin-right',
			'block-end' => 'margin-bottom',
			'inline-start' => 'margin-left',
		],
		'padding' => [
			'block-start' => 'padding-top',
			'inline-end' => 'padding-right',
			'block-end' => 'padding-bottom',
			'inline-start' => 'padding-left',
		],
	];

	private const BORDER_WIDTH_TO_PHYSICAL = [
		'block-start' => 'border-top-width',
		'inline-end' => 'border-right-width',
		'block-end' => 'border-bottom-width',
		'inline-start' => 'border-left-width',
	];

	private const BORDER_RADIUS_CORNERS = [
		'start-start' => 'border-top-left-radius',
		'start-end' => 'border-top-right-radius',
		'end-end' => 'border-bottom-right-radius',
		'end-start' => 'border-bottom-left-radius',
	];

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
			$rendered = $this->render_prop( $property, $prop );

			foreach ( $rendered as $line ) {
				$declarations[] = $line;
			}
		}

		return $declarations;
	}

	private function render_prop( string $property, $prop ): array {
		if ( ! is_array( $prop ) || ! isset( $prop['$$type'] ) ) {
			return [];
		}

		switch ( $prop['$$type'] ) {
			case 'color':
				return $this->simple( $property, $this->render_color( $prop['value'] ?? null ) );

			case 'size':
				return $this->simple( $property, $this->render_size( $prop['value'] ?? null ) );

			case 'number':
				return $this->simple( $property, $this->render_number( $prop['value'] ?? null ) );

			case 'string':
				return $this->simple( $property, $this->render_string( $prop['value'] ?? null ) );

			case 'dimensions':
				return $this->render_dimensions( $property, $prop['value'] ?? null );

			case 'border-width':
				return $this->render_border_width( $prop['value'] ?? null );

			case 'border-radius':
				return $this->render_border_radius( $prop['value'] ?? null );

			case 'flex':
				return $this->render_flex( $prop['value'] ?? null );

			case 'background':
				return $this->render_background( $prop['value'] ?? null );

			case 'box-shadow':
				return $this->simple( $property, $this->render_box_shadow( $prop['value'] ?? null ) );

			case 'layout-direction':
				return $this->render_layout_direction( $prop['value'] ?? null );
		}

		return [];
	}

	private function simple( string $property, ?string $value ): array {
		if ( null === $value || '' === $value ) {
			return [];
		}

		return [ $property . ': ' . $value . ';' ];
	}

	private function render_color( $value ): ?string {
		return is_string( $value ) ? $value : null;
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

	private function render_number( $value ): ?string {
		return is_numeric( $value ) ? (string) $value : null;
	}

	private function render_string( $value ): ?string {
		return is_string( $value ) ? $value : null;
	}

	private function render_dimensions( string $property, $value ): array {
		if ( ! is_array( $value ) ) {
			return [];
		}

		$mapping = self::DIMENSIONS_TO_PHYSICAL[ $property ] ?? null;

		if ( null === $mapping ) {
			return [];
		}

		$rendered_sides = [];

		foreach ( $mapping as $logical => $physical ) {
			$side = $value[ $logical ] ?? null;

			if ( ! is_array( $side ) || ! isset( $side['$$type'] ) || 'size' !== $side['$$type'] ) {
				continue;
			}

			$rendered = $this->render_size( $side['value'] ?? null );

			if ( null === $rendered ) {
				continue;
			}

			$rendered_sides[ $physical ] = $rendered;
		}

		if ( count( $rendered_sides ) === 4 && count( array_unique( $rendered_sides ) ) === 1 ) {
			return [ $property . ': ' . reset( $rendered_sides ) . ';' ];
		}

		$lines = [];

		foreach ( $rendered_sides as $physical => $rendered ) {
			$lines[] = $physical . ': ' . $rendered . ';';
		}

		return $lines;
	}

	private function render_border_width( $value ): array {
		if ( ! is_array( $value ) ) {
			return [];
		}

		$rendered_sides = [];

		foreach ( self::BORDER_WIDTH_TO_PHYSICAL as $logical => $physical ) {
			$side = $value[ $logical ] ?? null;

			if ( ! is_array( $side ) || ( $side['$$type'] ?? null ) !== 'size' ) {
				continue;
			}

			$rendered = $this->render_size( $side['value'] ?? null );

			if ( null === $rendered ) {
				continue;
			}

			$rendered_sides[ $physical ] = $rendered;
		}

		if ( count( $rendered_sides ) === 4 && count( array_unique( $rendered_sides ) ) === 1 ) {
			return [ 'border-width: ' . reset( $rendered_sides ) . ';' ];
		}

		$lines = [];

		foreach ( $rendered_sides as $physical => $rendered ) {
			$lines[] = $physical . ': ' . $rendered . ';';
		}

		return $lines;
	}

	private function render_layout_direction( $value ): array {
		if ( ! is_array( $value ) ) {
			return [];
		}

		$row_prop = $value['row'] ?? null;
		$column_prop = $value['column'] ?? null;

		$row = ( is_array( $row_prop ) && ( $row_prop['$$type'] ?? null ) === 'size' )
			? $this->render_size( $row_prop['value'] ?? null )
			: null;
		$column = ( is_array( $column_prop ) && ( $column_prop['$$type'] ?? null ) === 'size' )
			? $this->render_size( $column_prop['value'] ?? null )
			: null;

		if ( null === $row && null === $column ) {
			return [];
		}

		if ( null !== $row && null !== $column ) {
			if ( $row === $column ) {
				return [ 'gap: ' . $row . ';' ];
			}

			return [ 'gap: ' . $row . ' ' . $column . ';' ];
		}

		if ( null !== $row ) {
			return [ 'row-gap: ' . $row . ';' ];
		}

		return [ 'column-gap: ' . $column . ';' ];
	}

	private function render_border_radius( $value ): array {
		if ( ! is_array( $value ) ) {
			return [];
		}

		$rendered_corners = [];

		foreach ( self::BORDER_RADIUS_CORNERS as $corner => $physical ) {
			$entry = $value[ $corner ] ?? null;

			if ( ! is_array( $entry ) || ! isset( $entry['$$type'] ) || 'size' !== $entry['$$type'] ) {
				continue;
			}

			$rendered = $this->render_size( $entry['value'] ?? null );

			if ( null === $rendered ) {
				continue;
			}

			$rendered_corners[ $physical ] = $rendered;
		}

		if ( count( $rendered_corners ) === 4 && count( array_unique( $rendered_corners ) ) === 1 ) {
			return [ 'border-radius: ' . reset( $rendered_corners ) . ';' ];
		}

		$lines = [];

		foreach ( $rendered_corners as $physical => $rendered ) {
			$lines[] = $physical . ': ' . $rendered . ';';
		}

		return $lines;
	}

	private function render_flex( $value ): array {
		if ( ! is_array( $value ) ) {
			return [];
		}

		$grow = $this->extract_inner( $value['flexGrow'] ?? null, 'number' );
		$shrink = $this->extract_inner( $value['flexShrink'] ?? null, 'number' );
		$basis_prop = $value['flexBasis'] ?? null;
		$basis = ( is_array( $basis_prop ) && ( $basis_prop['$$type'] ?? null ) === 'size' )
			? $this->render_size( $basis_prop['value'] ?? null )
			: null;

		$lines = [];

		if ( null !== $grow ) {
			$lines[] = 'flex-grow: ' . $grow . ';';
		}

		if ( null !== $shrink ) {
			$lines[] = 'flex-shrink: ' . $shrink . ';';
		}

		if ( null !== $basis ) {
			$lines[] = 'flex-basis: ' . $basis . ';';
		}

		return $lines;
	}

	private function render_background( $value ): array {
		if ( ! is_array( $value ) ) {
			return [];
		}

		$color_prop = $value['color'] ?? null;

		if ( is_array( $color_prop ) && ( $color_prop['$$type'] ?? null ) === 'color' ) {
			$rendered = $this->render_color( $color_prop['value'] ?? null );

			if ( null !== $rendered ) {
				return [ 'background-color: ' . $rendered . ';' ];
			}
		}

		return [];
	}

	private function render_box_shadow( $value ): ?string {
		if ( ! is_array( $value ) ) {
			return null;
		}

		$items = [];

		foreach ( $value as $entry ) {
			if ( ! is_array( $entry ) || ( $entry['$$type'] ?? null ) !== 'shadow' ) {
				continue;
			}

			$shadow = $entry['value'] ?? null;

			if ( ! is_array( $shadow ) ) {
				continue;
			}

			$parts = [];
			$position = $this->extract_inner( $shadow['position'] ?? null, 'string' );

			if ( 'inset' === $position ) {
				$parts[] = 'inset';
			}

			foreach ( [ 'hOffset', 'vOffset', 'blur', 'spread' ] as $axis ) {
				$prop = $shadow[ $axis ] ?? null;

				if ( ! is_array( $prop ) || ( $prop['$$type'] ?? null ) !== 'size' ) {
					continue;
				}

				$rendered = $this->render_size( $prop['value'] ?? null );

				if ( null === $rendered ) {
					continue;
				}

				$parts[] = $rendered;
			}

			$color = $this->extract_inner( $shadow['color'] ?? null, 'color' );

			if ( null !== $color ) {
				$parts[] = $color;
			}

			if ( ! empty( $parts ) ) {
				$items[] = implode( ' ', $parts );
			}
		}

		return empty( $items ) ? null : implode( ', ', $items );
	}

	private function extract_inner( $prop, string $expected_type ) {
		if ( ! is_array( $prop ) || ( $prop['$$type'] ?? null ) !== $expected_type ) {
			return null;
		}

		return $prop['value'] ?? null;
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
