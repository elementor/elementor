<?php

namespace Elementor\Modules\AtomicWidgets\PropsHandler;

use Elementor\Modules\AtomicWidgets\Schema\Atomic_Prop;
use Exception;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Props_Handler {
	/**
	 * Each transformer can return a value that is also a transformable value,
	 * which means that it can be transformed again by another transformer.
	 * this constant defines the maximum depth of transformations.
	 */
	const TRANSFORM_DEPTH_LIMIT = 3;

	const CONTEXT_SETTINGS = 'settings';
	const CONTEXT_STYLE = 'style';

	/**
	 * @var array<Props_Handler>
	 */
	private static array $instances = [];

	private Transformers_Registry $transformers;

	public function __construct( Transformers_Registry $transformers ) {
		$this->transformers = $transformers;
	}

	public static function instance( string $context, bool $fresh = false ): self {
		if ( ! isset( self::$instances[ $context ] ) || $fresh ) {
			$registry = new Transformers_Registry();

			do_action( "elementor/atomic-widgets/{$context}/transformers", $registry );

			self::$instances[ $context ] = new self( $registry );
		}

		return self::$instances[ $context ];
	}

	public function handle( array $props, array $schema ): array {
		$result = [];

		foreach ( $schema as $prop_name => $prop_type ) {
			$result[ $prop_name ] = $prop_type instanceof Atomic_Prop
				? $this->transform( $props[ $prop_name ] ?? $prop_type->get_default(), $prop_type )
				: null;
		}

		return $result;
	}

	private function transform( $value, Atomic_Prop $prop_type, int $depth = 0 ) {
		if ( ! $value || ! $this->is_transformable( $value ) ) {
			return $value;
		}

		if ( $depth >= self::TRANSFORM_DEPTH_LIMIT ) {
			return null;
		}

		$transformer = $this->transformers->get( $value['$$type'] );

		if ( ! ( $transformer instanceof Transformer_Base ) ) {
			return null;
		}

		try {
			$transformed_value = $transformer
				->set_props_handler( $this )
				->transform( $value['value'] ); // TODO: Here the prop_type should pass the children prop_types schema so it can be used in the transformer.

			return $this->transform( $transformed_value, $prop_type, $depth + 1 );
		} catch ( Exception $e ) {
			return null;
		}
	}

	private function is_transformable( $value ): bool {
		return (
			! empty( $value['$$type'] ) &&
			is_string( $value['$$type'] ) &&
			! empty( $value['value'] )
		);
	}
}
