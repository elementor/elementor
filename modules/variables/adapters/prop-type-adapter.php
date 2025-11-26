<?php

namespace Elementor\Modules\Variables\Adapters;

use Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\Variables\PropTypes\Color_Variable_Prop_Type;
use Elementor\Modules\Variables\PropTypes\Font_Variable_Prop_Type;
use Elementor\Modules\Variables\Storage\Entities\Variable;
use Elementor\Modules\Variables\Storage\Variables_Collection;

class Prop_Type_Adapter {
	const GLOBAL_SIZE_VARIABLE_KEY = 'global-size-variable';
	const GLOBAL_CUSTOM_SIZE_VARIABLE_KEY = 'global-custom-size-variable';

	public static function to_storage( Variables_Collection $collection ): void {
		$schema = self::get_schema();

		$collection->each( function( Variable $variable ) use ( $schema ) {
			$type = $variable->type();
			$value = $variable->value();
			$prop_type = $schema[ $type ] ?? null;

			if ( is_array( $value ) || ! $prop_type ) {
				return;
			}

			if ( self::GLOBAL_SIZE_VARIABLE_KEY === $type ) {
				$value = self::parse_size_value( $value );
			}

			if ( self::GLOBAL_CUSTOM_SIZE_VARIABLE_KEY === $type ) {
				$value = [
					'size' => $value,
					'unit' => 'custom',
				];
			}

			$variable->set_value( $prop_type::generate( $value ) );
		} );
	}

	public static function from_storage( Variables_Collection $collection ): Variables_Collection {
		$collection->each( function( Variable $variable ) {
			$value = $variable->value();

			if ( ! is_array( $value ) ) {
				return;
			}

			$value = $value['value'];

			if ( self::GLOBAL_SIZE_VARIABLE_KEY === $variable->type() ) {
				$value = $value['size'] . $value['unit'];
			}

			if ( self::GLOBAL_CUSTOM_SIZE_VARIABLE_KEY === $variable->type() ) {
				$value = $value['size'];
			}

			$variable->set_value( $value );
		} );

		return $collection;
	}

	private static function get_schema(): array {
		return [
			Color_Variable_Prop_Type::get_key() => Color_Prop_Type::class,
			Font_Variable_Prop_Type::get_key() => String_Prop_Type::class,
			self::GLOBAL_SIZE_VARIABLE_KEY => Size_Prop_Type::class,
			self::GLOBAL_CUSTOM_SIZE_VARIABLE_KEY => Size_Prop_Type::class,
		];
	}

	private static function parse_size_value( string $value ) {
		$value = trim( strtolower( $value ) );

		if ( 'auto' === $value ) {
			return [
				'size' => '',
				'unit' => 'auto',
			];
		}

		if ( preg_match( '/^(-?\d*\.?\d+)([a-z%]+)$/i', trim( $value ), $matches ) ) {
			return [
				'size' => $matches[1] + 0,
				'unit' => strtolower( $matches[2] ),
			];
		}

		return $value;
	}
}
