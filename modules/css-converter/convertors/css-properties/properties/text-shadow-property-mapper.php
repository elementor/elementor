<?php

namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Atomic_Property_Mapper_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Text_Shadow_Property_Mapper extends Atomic_Property_Mapper_Base {

	private const SUPPORTED_PROPERTIES = [
		'text-shadow',
	];

	public function map_to_v4_atomic( string $property, $value ): ?array {
		if ( ! $this->is_supported_property( $property ) ) {
			error_log( "DEBUG: Text_Shadow_Property_Mapper - Property '$property' not supported" );
			return null;
		}

		if ( ! is_string( $value ) || 'none' === trim( $value ) ) {
			error_log( "DEBUG: Text_Shadow_Property_Mapper - Invalid value: " . var_export( $value, true ) );
			return null;
		}

		$parsed = $this->parse_text_shadow( $value );
		if ( ! $parsed ) {
			error_log( "DEBUG: Text_Shadow_Property_Mapper - Failed to parse value: '$value'" );
			return null;
		}

		$result = [
			'$$type' => 'shadow',
			'value' => [
				'hOffset' => [
					'$$type' => 'size',
					'value' => $parsed['h_offset']
				],
				'vOffset' => [
					'$$type' => 'size',
					'value' => $parsed['v_offset']
				],
				'blur' => [
					'$$type' => 'size',
					'value' => $parsed['blur']
				],
				'color' => [
					'$$type' => 'color',
					'value' => $parsed['color']
				],
			]
		];

		error_log( "DEBUG: Text_Shadow_Property_Mapper - Successfully mapped '$value' to: " . json_encode( $result ) );
		error_log( "WARNING: Text_Shadow_Property_Mapper - text-shadow is NOT supported by atomic widgets (missing from style-schema.php)" );
		
		return $result;
	}

	public function get_supported_properties(): array {
		return self::SUPPORTED_PROPERTIES;
	}

	public function is_supported_property( string $property ): bool {
		return in_array( $property, self::SUPPORTED_PROPERTIES, true );
	}

	private function parse_text_shadow( string $value ): ?array {
		$pattern = '/^(-?\d+(?:\.\d+)?(?:px|em|rem|%|vh|vw)?)\s+(-?\d+(?:\.\d+)?(?:px|em|rem|%|vh|vw)?)\s*(?:(-?\d+(?:\.\d+)?(?:px|em|rem|%|vh|vw)?)\s*)?(.*)$/';
		
		if ( ! preg_match( $pattern, trim( $value ), $matches ) ) {
			return null;
		}

		$h_offset = $this->parse_single_size( $matches[1] );
		$v_offset = $this->parse_single_size( $matches[2] );
		$blur = ! empty( $matches[3] ) ? $this->parse_single_size( $matches[3] ) : [ 'size' => 0.0, 'unit' => 'px' ];
		$color_string = ! empty( $matches[4] ) ? trim( $matches[4] ) : '#000000';

		if ( ! $h_offset || ! $v_offset ) {
			return null;
		}

		$color = $this->normalize_color( $color_string );

		return [
			'h_offset' => $h_offset,
			'v_offset' => $v_offset,
			'blur' => $blur,
			'color' => $color
		];
	}

	private function parse_single_size( string $value ): ?array {
		$value = trim( $value );
		
		$pattern = '/^(-?\d+(?:\.\d+)?)(px|em|rem|%|vh|vw)?$/';
		if ( ! preg_match( $pattern, $value, $matches ) ) {
			return null;
		}

		return [
			'size' => (float) $matches[1],
			'unit' => $matches[2] ?? 'px'
		];
	}

	private function normalize_color( string $value ): string {
		$value = trim( $value );

		if ( str_starts_with( $value, 'rgba' ) ) {
			if ( preg_match( '/rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*[\d.]+\s*\)/', $value, $matches ) ) {
				return sprintf( '#%02x%02x%02x', $matches[1], $matches[2], $matches[3] );
			}
		}

		if ( str_starts_with( $value, 'rgb' ) ) {
			if ( preg_match( '/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/', $value, $matches ) ) {
				return sprintf( '#%02x%02x%02x', $matches[1], $matches[2], $matches[3] );
			}
		}

		if ( str_starts_with( $value, '#' ) ) {
			return $value;
		}

		$named_colors = [
			'black' => '#000000',
			'white' => '#ffffff',
			'red' => '#ff0000',
			'green' => '#008000',
			'blue' => '#0000ff',
		];

		return $named_colors[ strtolower( $value ) ] ?? '#000000';
	}
}

