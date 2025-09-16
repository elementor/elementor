<?php
namespace Elementor\Modules\CssConverter\ClassConvertors;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Border_Zero_Property_Mapper implements Class_Property_Mapper_Interface {
	const SUPPORTED_PROPERTIES = array( 'border' );
	const ZERO_VALUES          = array( '0', '0px', 'none' );

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
		return array(
			'border-top-width'    => array(
				'$$type' => 'size',
				'value'  => array(
					'size' => 0,
					'unit' => 'px',
				),
			),
			'border-right-width'  => array(
				'$$type' => 'size',
				'value'  => array(
					'size' => 0,
					'unit' => 'px',
				),
			),
			'border-bottom-width' => array(
				'$$type' => 'size',
				'value'  => array(
					'size' => 0,
					'unit' => 'px',
				),
			),
			'border-left-width'   => array(
				'$$type' => 'size',
				'value'  => array(
					'size' => 0,
					'unit' => 'px',
				),
			),
			'border-top-style'    => array(
				'$$type' => 'string',
				'value'  => 'none',
			),
			'border-right-style'  => array(
				'$$type' => 'string',
				'value'  => 'none',
			),
			'border-bottom-style' => array(
				'$$type' => 'string',
				'value'  => 'none',
			),
			'border-left-style'   => array(
				'$$type' => 'string',
				'value'  => 'none',
			),
		);
	}
}
