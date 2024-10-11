<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Prop_Type;
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

			$resolved_props[ $key ] = array_key_exists( $key, $props )
				? $props[ $key ]
				: $prop_type->get_default();
		}

		return array_map(
			fn( $value ) => $this->transform( $value ),
			$resolved_props
		);
	}

	private function transform( $value, int $depth = 0 ) {
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
			$value['value'] = array_map(
				fn( $item ) => $this->transform( $item ),
				$value['value']
			);
		}

		$transformer = $this->transformers->get( $value['$$type'] );

		if ( ! ( $transformer instanceof Transformer_Base ) ) {
			return null;
		}

		try {
			$transformed_value = $transformer->transform( $value['value'] );

			return $this->transform( $transformed_value, $depth + 1 );
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
}
