<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Array_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Migratable_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Union_Prop_Type;
use Exception;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

abstract class Props_Resolver {
	protected static array $instances = [];

	protected Transformers_Registry $transformers_registry;

	protected function __construct( Transformers_Registry $transformers_registry ) {
		$this->transformers_registry = $transformers_registry;
	}

	protected static function instance( string $context ) {
		if ( ! isset( static::$instances[ $context ] ) ) {
			$instance = new static( new Transformers_Registry() );

			static::$instances[ $context ] = $instance;

			do_action(
				"elementor/atomic-widgets/$context/transformers/register",
				$instance->get_transformers_registry(),
				$instance
			);
		}

		return static::$instances[ $context ];
	}

	public static function reset(): void {
		static::$instances = [];
	}

	public function get_transformers_registry(): Transformers_Registry {
		return $this->transformers_registry;
	}

	protected function transform( $value, $key, Prop_Type $prop_type ) {
		$value = $this->migrate_prop_type( $value, $prop_type );

		if ( $prop_type instanceof Union_Prop_Type ) {
			$prop_type = $prop_type->get_prop_type( $value['$$type'] );

			if ( ! $prop_type ) {
				return null;
			}
		}

		if ( $value['$$type'] !== $prop_type::get_key() ) {
			return null;
		}

		if ( $prop_type instanceof Object_Prop_Type ) {
			if ( ! is_array( $value['value'] ) ) {
				return null;
			}

			$value['value'] = $this->resolve(
				$prop_type->get_shape(),
				$value['value']
			);
		}

		if ( $prop_type instanceof Array_Prop_Type ) {
			if ( ! is_array( $value['value'] ) ) {
				return null;
			}

			$value['value'] = array_map(
				fn( $item ) => $this->resolve_item( $item, null, $prop_type->get_item_type() ),
				$value['value']
			);
		}

		$transformer = $this->transformers_registry->get( $value['$$type'] );

		if ( ! ( $transformer instanceof Transformer_Base ) ) {
			return null;
		}

		try {
			$context = Props_Resolver_Context::make()
				->set_key( $key )
				->set_disabled( (bool) ( $value['disabled'] ?? false ) )
				->set_prop_type( $prop_type );

			return $transformer->transform( $value['value'], $context );
		} catch ( Exception $e ) {
			return null;
		}
	}

	protected function is_transformable( $value ): bool {
		return (
			! empty( $value['$$type'] ) &&
			array_key_exists( 'value', $value )
		);
	}

	protected function migrate_prop_type( $value, Prop_Type $prop_type ) {
		if ( ! is_array( $value ) || ! isset( $value['$$type'] ) || ! isset( $value['value'] ) ) {
			return $value;
		}

		if ( $prop_type instanceof Union_Prop_Type ) {
			$prop_types = $prop_type->get_prop_types();

			foreach ( $prop_types as $union_prop_type ) {
				if ( ! $union_prop_type instanceof Migratable_Prop_Type ) {
					continue;
				}

				$expected_key = $union_prop_type::get_key();

				if ( $value['$$type'] === $expected_key ) {
					break;
				}

				$compatible_keys = $union_prop_type->get_compatible_type_keys();

				if ( ! in_array( $value['$$type'], $compatible_keys, true ) ) {
					continue;
				}

				$value['$$type'] = $expected_key;
				break;
			}
		} elseif ( $prop_type instanceof Migratable_Prop_Type ) {
			$expected_key = $prop_type::get_key();

			if ( $value['$$type'] === $expected_key ) {
				return $value;
			}

			$compatible_keys = $prop_type->get_compatible_type_keys();

			if ( in_array( $value['$$type'], $compatible_keys, true ) ) {
				$value['$$type'] = $expected_key;
			}
		}

		return $value;
	}

	abstract public function resolve( array $schema, array $props ): array;

	abstract protected function resolve_item( $value, $key, Prop_Type $prop_type );
}
