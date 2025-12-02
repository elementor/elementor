<?php

namespace Elementor\Modules\Variables\Adapters;

use Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\Variables\PropTypes\Color_Variable_Prop_Type;
use Elementor\Modules\Variables\PropTypes\Font_Variable_Prop_Type;
use Elementor\Modules\Variables\PropTypes\Size_Variable_Prop_Type;
use Elementor\Modules\Variables\Storage\Entities\Variable;
use Elementor\Modules\Variables\Storage\Variables_Collection;

class Prop_Type_Adapter {
	public const CUSTOM_SIZE_KEY = 'global-custom-size-variable';

	public static function to_storage( Variables_Collection $collection ): array {
		$schema = self::get_schema();

		$collection->set_version( Variables_Collection::FORMAT_VERSION_V2 );

		$record = $collection->serialize();

		$collection->each( function( Variable $variable ) use ( $schema, &$record ) {
			$type = $variable->type();
			$value = $variable->value();
			$prop_type = $schema[ $type ] ?? null;

			if ( is_array( $value ) || ! $prop_type ) {
				return;
			}

			if ( Size_Variable_Prop_Type::get_key() === $type ) {
				$value = self::parse_size_value( $value );
			}

			if ( self::CUSTOM_SIZE_KEY === $type ) {
				$value = [
					'size' => $value,
					'unit' => 'custom',
				];
			}

			$record['data'][ $variable->id() ] = array_merge( $variable->to_array(), [ 'value' => $prop_type::generate( $value ) ] );
		} );

		return $record;
	}

	public static function from_storage( Variables_Collection $collection ): Variables_Collection {
		$collection->each( function( Variable $variable ) {
			$value = $variable->value();

			if ( ! is_array( $value ) ) {
				return;
			}

			$value = $value['value'];

			if ( Size_Variable_Prop_Type::get_key() === $variable->type() ) {
				$value = $value['size'] . $value['unit'];
			}

			if ( self::CUSTOM_SIZE_KEY === $variable->type() ) {
				$value = $value['size'];
			}

			$variable->set_value( $value );
		} );

		$collection->set_version( Variables_Collection::FORMAT_VERSION_V1 );

		return $collection;
	}

	private static function get_schema(): array {
		return [
			Color_Variable_Prop_Type::get_key() => Color_Prop_Type::class,
			Font_Variable_Prop_Type::get_key() => String_Prop_Type::class,
			Size_Variable_Prop_Type::get_key() => Size_Prop_Type::class,
			self::CUSTOM_SIZE_KEY => Size_Prop_Type::class,
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
