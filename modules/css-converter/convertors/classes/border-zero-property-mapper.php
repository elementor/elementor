<?php
namespace Elementor\Modules\CssConverter\Convertors\Classes;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/unified-property-mapper-base.php';

class Border_Zero_Property_Mapper extends Unified_Property_Mapper_Base {
	const SUPPORTED_PROPERTIES = [ 'border' ];
	const ZERO_VALUES          = [ '0', '0px', 'none' ];

	public function get_supported_properties(): array {
		return self::SUPPORTED_PROPERTIES;
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
