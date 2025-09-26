<?php

namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Property_Mapper_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Box_Shadow_Property_Mapper extends Property_Mapper_Base {

	private const SUPPORTED_PROPERTIES = [
		'box-shadow',
	];

	public function map_to_v4_atomic( string $property, $value ): ?array {
		if ( ! $this->is_supported_property( $property ) ) {
			return null;
		}

		$shadows_data = $this->parse_box_shadow_value( $value );
		if ( null === $shadows_data ) {
			return null;
		}

		return $this->create_v4_property_with_type( 'box-shadow', 'box-shadow', $shadows_data );
	}

	public function is_supported_property( string $property ): bool {
		return in_array( $property, self::SUPPORTED_PROPERTIES, true );
	}

	private function parse_box_shadow_value( $value ): ?array {
		if ( ! is_string( $value ) ) {
			return null;
		}

		$value = trim( $value );

		if ( empty( $value ) || 'none' === $value ) {
			return [];
		}

		$shadows = $this->split_multiple_shadows( $value );
		$parsed_shadows = [];

		foreach ( $shadows as $shadow ) {
			$parsed_shadow = $this->parse_single_shadow( $shadow );
			if ( null === $parsed_shadow ) {
				return null;
			}
			$parsed_shadows[] = $parsed_shadow;
		}

		return $parsed_shadows;
	}

	private function split_multiple_shadows( string $value ): array {
		$shadows = [];
		$current_shadow = '';
		$paren_depth = 0;
		$in_function = false;

		$chars = str_split( $value );
		for ( $i = 0; $i < count( $chars ); $i++ ) {
			$char = $chars[ $i ];

			if ( '(' === $char ) {
				$paren_depth++;
				$in_function = true;
			} elseif ( ')' === $char ) {
				$paren_depth--;
				if ( 0 === $paren_depth ) {
					$in_function = false;
				}
			} elseif ( ',' === $char && ! $in_function && 0 === $paren_depth ) {
				$shadows[] = trim( $current_shadow );
				$current_shadow = '';
				continue;
			}

			$current_shadow .= $char;
		}

		if ( ! empty( trim( $current_shadow ) ) ) {
			$shadows[] = trim( $current_shadow );
		}

		return $shadows;
	}

	private function parse_single_shadow( string $shadow ): ?array {
		$shadow = trim( $shadow );
		if ( empty( $shadow ) ) {
			return null;
		}

		$is_inset = false;
		if ( str_starts_with( $shadow, 'inset ' ) ) {
			$is_inset = true;
			$shadow = trim( substr( $shadow, 6 ) );
		}

		$parts = $this->tokenize_shadow_parts( $shadow );
		if ( count( $parts ) < 2 ) {
			return null;
		}

		$h_offset = null;
		$v_offset = null;
		$blur = null;
		$spread = null;
		$color = null;

		$size_values = [];
		$color_values = [];

		foreach ( $parts as $part ) {
			if ( $this->is_color_value( $part ) ) {
				$color_values[] = $part;
			} elseif ( $this->is_size_value( $part ) ) {
				$size_values[] = $part;
			}
		}

		if ( count( $size_values ) < 2 ) {
			return null;
		}

		$h_offset = $this->parse_size_value( $size_values[0] );
		$v_offset = $this->parse_size_value( $size_values[1] );

		if ( null === $h_offset || null === $v_offset ) {
			return null;
		}

		if ( isset( $size_values[2] ) ) {
			$blur = $this->parse_size_value( $size_values[2] );
			if ( null === $blur ) {
				return null;
			}
		} else {
			$blur = [ 'size' => 0.0, 'unit' => 'px' ];
		}

		if ( isset( $size_values[3] ) ) {
			$spread = $this->parse_size_value( $size_values[3] );
			if ( null === $spread ) {
				return null;
			}
		} else {
			$spread = [ 'size' => 0.0, 'unit' => 'px' ];
		}

		if ( ! empty( $color_values ) ) {
			$color = $this->parse_color_value( $color_values[0] );
		}

		if ( null === $color ) {
			$color = 'rgba(0, 0, 0, 0.5)';
		}

		return [
			'$$type' => 'shadow',
			'value' => [
				'hOffset' => [ '$$type' => 'size', 'value' => $h_offset ],
				'vOffset' => [ '$$type' => 'size', 'value' => $v_offset ],
				'blur' => [ '$$type' => 'size', 'value' => $blur ],
				'spread' => [ '$$type' => 'size', 'value' => $spread ],
				'color' => [ '$$type' => 'color', 'value' => $color ],
				'position' => $is_inset ? 'inset' : null,
			],
		];
	}

	private function tokenize_shadow_parts( string $shadow ): array {
		$parts = [];
		$current_part = '';
		$paren_depth = 0;

		$chars = str_split( $shadow );
		for ( $i = 0; $i < count( $chars ); $i++ ) {
			$char = $chars[ $i ];

			if ( '(' === $char ) {
				$paren_depth++;
			} elseif ( ')' === $char ) {
				$paren_depth--;
			} elseif ( ' ' === $char && 0 === $paren_depth ) {
				if ( ! empty( trim( $current_part ) ) ) {
					$parts[] = trim( $current_part );
					$current_part = '';
				}
				continue;
			}

			$current_part .= $char;
		}

		if ( ! empty( trim( $current_part ) ) ) {
			$parts[] = trim( $current_part );
		}

		return $parts;
	}

	private function is_color_value( string $value ): bool {
		$value = trim( $value );

		if ( str_starts_with( $value, '#' ) ) {
			return true;
		}

		if ( str_starts_with( $value, 'rgb' ) || str_starts_with( $value, 'hsl' ) ) {
			return true;
		}

		$named_colors = [
			'transparent', 'black', 'white', 'red', 'green', 'blue', 'yellow',
			'cyan', 'magenta', 'gray', 'grey', 'orange', 'purple', 'pink',
			'brown', 'navy', 'teal', 'lime', 'olive', 'maroon', 'silver',
			'aqua', 'fuchsia'
		];

		return in_array( strtolower( $value ), $named_colors, true );
	}

	private function is_size_value( string $value ): bool {
		$value = trim( $value );

		if ( '0' === $value ) {
			return true;
		}

		$pattern = '/^-?(?:\d+(?:\.\d+)?|\.\d+)(px|em|rem|%|vw|vh)$/';
		return (bool) preg_match( $pattern, $value );
	}
}
