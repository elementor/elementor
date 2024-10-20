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

		return $this->assign_values( $resolved_props );
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
			$value['value'] = $this->assign_values( $value['value'] );
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

	private function is_nested_transformable( $value ): bool {
		return (
			$this->is_transformable( $value ) &&
			is_array( $value['value'] )
		);
	}

	private function assign_values( $values ) {
		$assigned = [];

		foreach ( $values as $key => $value ) {
			$transformed_value = $this->transform( $value, $key );

			if ( Multi_Props::is( $transformed_value ) ) {
				$assigned = array_merge( $assigned, Multi_Props::get_value( $transformed_value ) );

				continue;
			}

			$assigned[ $key ] = $transformed_value;
		}

		return $assigned;
	}
}
