<?php

namespace Elementor\Modules\DataFlow;

use Elementor\Modules\AtomicWidgets\Parsers\Props_Parser;
use Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Image_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Boolean_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * A container declares its state as a list of typed keys. Each key is validated through the atomic prop
 * types, and at most MAX_EXPOSED_CONTROLS keys are exposed as controls in the General tab.
 */
class State_Schema {
	const TYPE_ENUM = 'enum';
	const TYPE_COLOR = 'color';
	const TYPE_SIZE = 'size';
	const TYPE_IMAGE = 'image';
	const PROP_TYPES = [
		State_Params::TYPE_STRING,
		State_Params::TYPE_NUMBER,
		State_Params::TYPE_BOOLEAN,
		State_Params::TYPE_JSON,
		self::TYPE_ENUM,
		self::TYPE_COLOR,
		self::TYPE_SIZE,
		self::TYPE_IMAGE,
	];
	const OBJECT_PROP_TYPES = [ self::TYPE_SIZE, self::TYPE_IMAGE ];
	const MAX_EXPOSED_CONTROLS = 5;
	const MAX_OPTIONS = 50;
	const CONTROLS_BY_PROP_TYPE = [
		State_Params::TYPE_STRING => 'text',
		State_Params::TYPE_NUMBER => 'number',
		State_Params::TYPE_BOOLEAN => 'switch',
		self::TYPE_ENUM => 'select',
		self::TYPE_SIZE => 'size',
		self::TYPE_IMAGE => 'image',
	];
	const LEGACY_TYPES = [
		State_Params::TYPE_STRING => State_Params::TYPE_STRING,
		State_Params::TYPE_NUMBER => State_Params::TYPE_NUMBER,
		State_Params::TYPE_BOOLEAN => State_Params::TYPE_BOOLEAN,
		State_Params::TYPE_JSON => State_Params::TYPE_JSON,
		self::TYPE_ENUM => State_Params::TYPE_STRING,
		self::TYPE_COLOR => State_Params::TYPE_STRING,
		self::TYPE_SIZE => State_Params::TYPE_JSON,
		self::TYPE_IMAGE => State_Params::TYPE_JSON,
	];

	public static function sanitize( $declaration ): array {
		$declaration = is_string( $declaration ) ? json_decode( $declaration, true ) : $declaration;

		if ( ! is_array( $declaration ) ) {
			return [];
		}

		$sanitized = [];

		foreach ( $declaration as $param ) {
			$clean = self::sanitize_param( $param );

			if ( null !== $clean && ! isset( $sanitized[ $clean['key'] ] ) ) {
				$sanitized[ $clean['key'] ] = $clean;
			}
		}

		$sanitized = array_slice( array_values( $sanitized ), 0, State_Params::MAX_PARAMS );

		return self::cap_exposed( $sanitized );
	}

	public static function sanitize_param( $param ): ?array {
		if ( ! self::is_valid_param( $param ) ) {
			return null;
		}

		$clean = [
			'key' => $param['key'],
			'label' => State_Params::sanitize_label( $param['label'] ?? '', $param['key'] ),
			'prop_type' => $param['prop_type'],
		];

		if ( self::TYPE_ENUM === $param['prop_type'] ) {
			$clean['options'] = array_slice( array_values( array_unique( $param['options'] ) ), 0, self::MAX_OPTIONS );
		}

		$clean['default'] = self::sanitize_default( $clean, $param['default'] ?? null );

		$exposed = self::sanitize_exposed( $param['exposed'] ?? null, $clean );

		if ( null !== $exposed ) {
			$clean['exposed'] = $exposed;
		}

		return $clean;
	}

	/**
	 * @return array{values: array, invalid_keys: string[], unknown_keys: string[]}
	 */
	public static function sanitize_values( array $declaration, $values ): array {
		$values = is_string( $values ) ? json_decode( $values, true ) : $values;
		$values = is_array( $values ) ? $values : [];

		$declared = array_column( $declaration, null, 'key' );
		$unknown_keys = array_values( array_diff( array_keys( $values ), array_keys( $declared ) ) );
		$invalid_keys = [];
		$accepted = [];
		$wrapped = [];

		foreach ( $declared as $key => $param ) {
			if ( ! array_key_exists( $key, $values ) ) {
				continue;
			}

			if ( State_Params::is_parent_binding( $values[ $key ] ) ) {
				$accepted[ $key ] = $values[ $key ];
				continue;
			}

			$wrapped_value = self::wrap_value( $param, $values[ $key ] );

			if ( null === $wrapped_value ) {
				$invalid_keys[] = $key;
				continue;
			}

			$wrapped[ $key ] = $wrapped_value;
		}

		$parsed = Props_Parser::make( self::to_props_schema( $declaration ) )->parse( $wrapped );

		foreach ( $parsed->errors()->all() as $error ) {
			$invalid_keys[] = $error['key'];
		}

		foreach ( $parsed->unwrap() as $key => $value ) {
			$accepted[ $key ] = self::unwrap_value( $declared[ $key ], $value );
		}

		foreach ( $declared as $key => $param ) {
			if ( State_Params::TYPE_JSON === $param['prop_type'] && array_key_exists( $key, $wrapped ) ) {
				$accepted[ $key ] = $wrapped[ $key ]['value'];
			}
		}

		return [
			'values' => array_intersect_key( $accepted, $declared ),
			'invalid_keys' => array_values( array_unique( $invalid_keys ) ),
			'unknown_keys' => $unknown_keys,
		];
	}

	/**
	 * @return array<string, Prop_Type>
	 */
	public static function to_props_schema( array $declaration ): array {
		$schema = [];

		foreach ( $declaration as $param ) {
			$prop_type = self::make_prop_type( $param );

			if ( null !== $prop_type ) {
				$schema[ $param['key'] ] = $prop_type;
			}
		}

		return $schema;
	}

	public static function to_params( array $declaration ): array {
		return array_map( fn( $param ) => array_merge( $param, [
			'type' => self::LEGACY_TYPES[ $param['prop_type'] ],
		] ), $declaration );
	}

	public static function describe( array $params ): array {
		$schema = [];

		foreach ( $params as $param ) {
			$entry = [ 'prop_type' => $param['prop_type'] ?? $param['type'] ];

			if ( isset( $param['options'] ) ) {
				$entry['options'] = $param['options'];
			}

			$schema[ $param['key'] ] = $entry;
		}

		return $schema;
	}

	public static function describe_values( array $state ): array {
		return array_map( fn( $value ) => [ 'prop_type' => self::infer_prop_type( $value ) ], $state );
	}

	public static function infer_prop_type( $value ): string {
		if ( is_bool( $value ) ) {
			return State_Params::TYPE_BOOLEAN;
		}

		if ( is_int( $value ) || is_float( $value ) ) {
			return State_Params::TYPE_NUMBER;
		}

		return is_string( $value ) ? State_Params::TYPE_STRING : State_Params::TYPE_JSON;
	}

	public static function get_empty_value( array $param ) {
		if ( self::TYPE_ENUM === $param['prop_type'] ) {
			return $param['options'][0];
		}

		if ( in_array( $param['prop_type'], self::OBJECT_PROP_TYPES, true ) ) {
			return null;
		}

		return State_Params::get_empty_value( self::LEGACY_TYPES[ $param['prop_type'] ] );
	}

	private static function is_valid_param( $param ): bool {
		return is_array( $param )
			&& isset( $param['key'], $param['prop_type'] )
			&& is_string( $param['key'] )
			&& 1 === preg_match( State_Params::KEY_PATTERN, $param['key'] )
			&& in_array( $param['prop_type'], self::PROP_TYPES, true )
			&& ( self::TYPE_ENUM !== $param['prop_type'] || self::has_valid_options( $param['options'] ?? null ) );
	}

	private static function has_valid_options( $options ): bool {
		return is_array( $options )
			&& ! empty( $options )
			&& count( $options ) === count( array_filter( $options, 'is_string' ) );
	}

	private static function sanitize_default( array $param, $default ) {
		if ( State_Params::is_parent_binding( $default ) ) {
			return $default;
		}

		$wrapped = null === $default ? null : self::wrap_value( $param, $default );

		if ( null === $wrapped ) {
			return self::get_empty_value( $param );
		}

		if ( State_Params::TYPE_JSON === $param['prop_type'] ) {
			return $wrapped['value'];
		}

		$parsed = Props_Parser::make( self::to_props_schema( [ $param ] ) )->parse( [ $param['key'] => $wrapped ] );
		$value = $parsed->unwrap()[ $param['key'] ] ?? null;

		if ( ! $parsed->is_valid() || null === $value ) {
			return self::get_empty_value( $param );
		}

		return self::unwrap_value( $param, $value );
	}

	private static function sanitize_exposed( $exposed, array $param ): ?array {
		$control = self::CONTROLS_BY_PROP_TYPE[ $param['prop_type'] ] ?? null;

		if ( null === $control || ! is_array( $exposed ) || ( $exposed['control'] ?? null ) !== $control ) {
			return null;
		}

		return [
			'control' => $control,
			'label' => State_Params::sanitize_label( $exposed['label'] ?? '', $param['key'] ),
		];
	}

	public static function cap_exposed( array $declaration ): array {
		$exposed_count = 0;

		foreach ( $declaration as $index => $param ) {
			if ( ! isset( $param['exposed'] ) ) {
				continue;
			}

			if ( $exposed_count >= self::MAX_EXPOSED_CONTROLS ) {
				unset( $declaration[ $index ]['exposed'] );
				continue;
			}

			++$exposed_count;
		}

		return $declaration;
	}

	private static function make_prop_type( array $param ): ?Prop_Type {
		switch ( $param['prop_type'] ) {
			case State_Params::TYPE_STRING:
				return String_Prop_Type::make();
			case State_Params::TYPE_NUMBER:
				return Number_Prop_Type::make();
			case State_Params::TYPE_BOOLEAN:
				return Boolean_Prop_Type::make();
			case self::TYPE_ENUM:
				return String_Prop_Type::make()->enum( $param['options'] );
			case self::TYPE_COLOR:
				return Color_Prop_Type::make();
			case self::TYPE_SIZE:
				return Size_Prop_Type::make();
			case self::TYPE_IMAGE:
				return Image_Prop_Type::make();
			default:
				return null;
		}
	}

	private static function wrap_value( array $param, $value ): ?array {
		if ( in_array( $param['prop_type'], self::OBJECT_PROP_TYPES, true ) ) {
			return is_array( $value ) && ( $value['$$type'] ?? null ) === $param['prop_type'] ? $value : null;
		}

		if ( ! State_Params::coerce( $value, self::LEGACY_TYPES[ $param['prop_type'] ], $coerced ) ) {
			return null;
		}

		if ( State_Params::TYPE_JSON === $param['prop_type'] ) {
			return [ 'value' => $coerced ];
		}

		return [
			'$$type' => self::make_prop_type( $param )::get_key(),
			'value' => $coerced,
		];
	}

	private static function unwrap_value( array $param, $value ) {
		if ( in_array( $param['prop_type'], self::OBJECT_PROP_TYPES, true ) ) {
			return $value;
		}

		return $value['value'];
	}
}
