<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver;

use Elementor\Modules\AtomicWidgets\PropTypes\Prop_Type;
use Exception;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Props_Resolver {
	/**
	 * Each transformer can return a value that is also a transformable value,
	 * which means that it can be transformed again by another transformer.
	 * This constant defines the maximum depth of transformations to avoid infinite loops.
	 */
	const TRANSFORM_DEPTH_LIMIT = 3;

	const CONTEXT_SETTINGS = 'settings';
	const CONTEXT_STYLES = 'styles';

	/**
	 * @var array<string, Props_Resolver>
	 */
	private static array $instances = [];

	private Transformers_Registry $transformers;

	private function __construct( Transformers_Registry $transformers ) {
		$this->transformers = $transformers;
	}

	public static function for_styles() {
		return self::instance( self::CONTEXT_STYLES );
	}

	public static function for_settings() {
		return self::instance( self::CONTEXT_SETTINGS );
	}

	private static function instance( string $context, bool $fresh = false ): self {
		if ( ! isset( self::$instances[ $context ] ) || $fresh ) {
			$registry = new Transformers_Registry();

			do_action( "elementor/atomic-widgets/{$context}/transformers/register", $registry );

			self::$instances[ $context ] = new self( $registry );
		}

		return self::$instances[ $context ];
	}

	public function resolve( array $schema, array $props ): array {
		$resolved_props = [];

		foreach ( $schema as $key => $prop_type ) {
			if ( ! ( $prop_type instanceof Prop_Type ) ) {
				continue;
			}

			if ( ! array_key_exists( $key, $props ) ) {
				$resolved_props[ $key ] = $prop_type->get_default();
				continue;
			}

			$resolved_props[ $key ] = $props[ $key ];

			// Merge the top-level defaults for transformable props.
			if (
				$this->is_nested_transformable( $resolved_props[ $key ] ) &&
				$this->is_nested_transformable( $prop_type->get_default() )
			) {
				$resolved_props[ $key ]['value'] = array_merge(
					$prop_type->get_default()['value'],
					$resolved_props[ $key ]['value']
				);
			}
		}

		$transformed_props = [];

		foreach ( $resolved_props as $key => $value ) {
			$transformed = $this->transform( $value, $key );

			if ( $this->is_multi( $transformed ) ) {
				unset( $transformed_props[ $key ] );

				$transformed_props = array_merge( $transformed_props, $transformed['value'] );
				continue;
			}

			$transformed_props[ $key ] = $transformed;
		}

		return $transformed_props;
	}

	private function transform( $value, $key, int $depth = 0 ) {
		if ( ! $value || ! $this->is_transformable( $value ) ) {
			return $value;
		}

		if ( $depth >= self::TRANSFORM_DEPTH_LIMIT ) {
			return null;
		}

		if ( isset( $value['disabled'] ) && true === $value['disabled'] ) {
			return null;
		}

		// Transform nested transformable values recursively.
		if ( is_array( $value['value'] ) ) {
			foreach ( $value['value'] as $nested_key => $nested_value ) {
				$value['value'][ $nested_key ] = $this->transform( $nested_value, $nested_key, $depth + 1 );

				if ( $this->is_multi( $value['value'][ $nested_key ] ) ) {
					$multi_prop = $value['value'][ $nested_key ];
					unset( $value['value'][ $nested_key ] );
					$value['value'] = array_merge( $value['value'], $multi_prop['value'] );
				}
			}
		}

		$transformer = $this->transformers->get( $value['$$type'] );

		if ( ! ( $transformer instanceof Transformer_Base ) ) {
			return null;
		}

		try {
			$transformed_value = $transformer->transform( $value['value'], $key );

			return $this->transform( $transformed_value, $key, $depth + 1 );
		} catch ( Exception $e ) {
			return null;
		}
	}

	private function is_transformable( $value ): bool {
		return (
			! empty( $value['$$type'] ) &&
			array_key_exists( 'value', $value )
		);
	}

	private function is_multi( $value ): bool {
		return (
			! empty( $value['$$multi'] ) &&
			true === $value['$$multi'] &&
			array_key_exists( 'value', $value )
		);
	}

	private function is_nested_transformable( $value ): bool {
		return (
			$this->is_transformable( $value ) &&
			is_array( $value['value'] )
		);
	}
}
