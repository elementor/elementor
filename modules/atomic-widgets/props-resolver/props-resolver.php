<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Array_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Html_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Union_Prop_Type;
use Elementor\Modules\AtomicWidgets\Module as Atomic_Widgets_Module;
use Elementor\Plugin;
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
				->set_prop_type( $prop_type )
				->set_transformers_registry( $this->transformers_registry );

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

		$is_inline_editing_active = Plugin::$instance->experiments->is_feature_active( Atomic_Widgets_Module::EXPERIMENT_INLINE_EDITING );

		if ( $prop_type instanceof Union_Prop_Type ) {
			$prop_types = $prop_type->get_prop_types();
			$has_html_type = isset( $prop_types[ Html_Prop_Type::get_key() ] );
			$has_string_type = isset( $prop_types[ String_Prop_Type::get_key() ] );

			if ( $is_inline_editing_active && $has_html_type ) {
				if ( $value['$$type'] === String_Prop_Type::get_key() ) {
					$value['$$type'] = Html_Prop_Type::get_key();
				}
			} elseif ( ! $is_inline_editing_active && $has_string_type ) {
				if ( $value['$$type'] === Html_Prop_Type::get_key() ) {
					$value['$$type'] = String_Prop_Type::get_key();
				}
			}
		} elseif ( $is_inline_editing_active && $prop_type instanceof Html_Prop_Type ) {
			if ( $value['$$type'] === String_Prop_Type::get_key() ) {
				$value['$$type'] = Html_Prop_Type::get_key();
			}
		} elseif ( ! $is_inline_editing_active && $prop_type instanceof String_Prop_Type && ! ( $prop_type instanceof Html_Prop_Type ) ) {
			if ( $value['$$type'] === Html_Prop_Type::get_key() ) {
				$value['$$type'] = String_Prop_Type::get_key();
			}
		}

		return $value;
	}

	abstract public function resolve( array $schema, array $props ): array;

	abstract protected function resolve_item( $value, $key, Prop_Type $prop_type );
}
