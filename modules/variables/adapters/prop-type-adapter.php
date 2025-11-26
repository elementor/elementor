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

		if ( $value === 'auto' ) {
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







// size variable prop type not available when pro disabled

// I need parsing here
// 12px
// string -> prop value
//$prop_value = [
//	'$$type' => 'color' | 'string' | 'size',
//	'value' => $value,
//];













//				$resu = $union_prop_type->get_prop_type_from_value( $value );
//				$class = get_class( $prop_type );
//				;
//public static function from_storage( array $stored, array $shape ): array {
//	$output = [];
//
//	foreach ( $shape as $key => $prop_type ) {
//		$value = $stored[$key] ?? null;
//
//		if ( is_array( $value ) && isset( $value['$$type'] ) ) {
//			// It's a generated PropType wrapper
//			$output[$key] = self::decode_value_recursive(
//				$value['value'],
//				$prop_type
//			);
//		} else {
//			$output[$key] = $value;
//		}
//	}
//
//	return $output;
//}


//	/**
//	 * Recursively encode internal values for objects & arrays.
//	 */
//	private static function encode_value_recursive( $value, Prop_Type $prop_type ) {
//		// Object prop type
//		if ( method_exists( $prop_type, 'get_shape' ) ) {
//			$shape = $prop_type->get_shape();
//			$output = [];
//
//			foreach ( $shape as $key => $sub_prop ) {
//				$sub_value = $value[$key] ?? $sub_prop->get_default();
//
//				if ( $sub_prop instanceof Transformable_Prop_Type ) {
//					$output[$key] = $sub_prop::generate(
//						self::encode_value_recursive( $sub_value, $sub_prop )
//					);
//				} else {
//					$output[$key] = $sub_value;
//				}
//			}
//
//			return $output;
//		}
//
//		return $value;
//	}
// $schema = static::get_props_schema();
//		$props_parser = Props_Parser::make( $schema );
//
//		$result = $props_parser->parse( $settings );
//
//		if ( ! $result->is_valid() ) {
//			throw new \Exception( esc_html( 'Settings validation failed. ' . $result->errors()->to_string() ) );
//		}
//
//		return $result->unwrap();
// get collection
// loop trough each collection
// validate if valid for conversion thru variable extract value
// convert
// set back to variable
//		$output = [];
//		foreach ( $shape as $key => $prop_type ) {
//			$value = $raw[$key] ?? $prop_type->get_default();
//
//			if ( $prop_type instanceof Transformable_Prop_Type ) {
//				$output[ $key ] = $prop_type::generate(
//					self::encode_value_recursive( $value, $prop_type )
//				);
//			} else {
//				$output[ $key ] = $value;
//			}
//		}
//		return $output;
/**
 * Decode JSON-loaded DB values into pure PHP types.
 *
 * @param array $stored
 * @param array<string,Prop_Type> $shape
 * @return array
 */
//	/**
//	 * Recursively unwrap values based on PropType definitions.
//	 */
//	private static function decode_value_recursive( $value, Prop_Type $prop_type ) {
//		if ( method_exists( $prop_type, 'get_shape' ) ) {
//			$shape = $prop_type->get_shape();
//			$output = [];
//
//			foreach ( $shape as $key => $sub_prop ) {
//				$sub_value = $value[$key] ?? $sub_prop->get_default();
//
//				if ( is_array( $sub_value ) && isset( $sub_value['$$type'] ) ) {
//					$output[$key] = self::decode_value_recursive(
//						$sub_value['value'],
//						$sub_prop
//					);
//				} else {
//					$output[$key] = $sub_value;
//				}
//			}
//
//			return $output;
//		}
//
//		return $value;
//	}
