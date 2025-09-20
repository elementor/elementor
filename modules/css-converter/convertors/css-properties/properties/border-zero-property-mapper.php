<?php
namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Property_Mapper_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
class Border_Zero_Property_Mapper extends Property_Mapper_Base {
	const SUPPORTED_PROPERTIES = [ 'border' ];
	const ZERO_VALUES          = [ '0', '0px', 'none' ];

	public function get_supported_properties(): array {
		return self::SUPPORTED_PROPERTIES;
	}

	public function map_to_v4_atomic( string $property, $value ): ?array {
		if ( ! $this->supports( $property, $value ) ) {
			return null;
		}

		// Basic implementation - convert property name to v4 format
		// Keep original property name with hyphens for consistency
		return $this->create_v4_property( $property, $value );
	}

	public function supports( string $property, $value ): bool {
		if ( ! in_array( $property, self::SUPPORTED_PROPERTIES, true ) ) {
			return false;
		}

		$value = trim( strtolower( $value ) );
		return in_array( $value, self::ZERO_VALUES, true );
	}

	public function map_to_schema( string $property, $value ): array {
		return [
			'border-top-width'    => [
				'$$type' => 'size',
				'value'  => [
					'size' => 0,
					'unit' => 'px',
				],
			],
			'border-right-width'  => [
				'$$type' => 'size',
				'value'  => [
					'size' => 0,
					'unit' => 'px',
				],
			],
			'border-bottom-width' => [
				'$$type' => 'size',
				'value'  => [
					'size' => 0,
					'unit' => 'px',
				],
			],
			'border-left-width'   => [
				'$$type' => 'size',
				'value'  => [
					'size' => 0,
					'unit' => 'px',
				],
			],
			'border-top-style'    => [
				'$$type' => 'string',
				'value'  => 'none',
			],
			'border-right-style'  => [
				'$$type' => 'string',
				'value'  => 'none',
			],
			'border-bottom-style' => [
				'$$type' => 'string',
				'value'  => 'none',
			],
			'border-left-style'   => [
				'$$type' => 'string',
				'value'  => 'none',
			],
		];
	}
}
