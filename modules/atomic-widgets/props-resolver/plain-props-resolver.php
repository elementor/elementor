<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver;

use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Plain_Passthrough_Transformer;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Walks a transformable value tree (with `$$type`/`value` envelopes) and returns
 * the same shape with envelopes stripped — the inverse of Plain_Values_Resolver.
 *
 * Reuses Props_Resolver's Union/Object/Array recursion; a passthrough fallback
 * transformer returns each already-recursed value as-is.
 */
class Plain_Props_Resolver extends Props_Resolver {
	const CONTEXT_PLAIN = 'plain';

	public static function make(): self {
		$is_new = ! isset( static::$instances[ self::CONTEXT_PLAIN ] );
		$instance = static::instance( self::CONTEXT_PLAIN );

		if ( $is_new ) {
			$instance->get_transformers_registry()->register_fallback( new Plain_Passthrough_Transformer() );
		}

		return $instance;
	}

	public function resolve_value( $value, Prop_Type $prop_type ) {
		return $this->resolve_item( $value, null, $prop_type );
	}

	public function resolve( array $schema, array $props ): array {
		$resolved = [];

		foreach ( $schema as $key => $prop_type ) {
			if ( ! ( $prop_type instanceof Prop_Type ) ) {
				continue;
			}

			$value = $this->resolve_item( $props[ $key ] ?? null, $key, $prop_type );

			if ( null === $value ) {
				continue;
			}

			$resolved[ $key ] = $value;
		}

		return $resolved;
	}

	protected function resolve_item( $value, $key, Prop_Type $prop_type ) {
		if ( null === $value ) {
			return null;
		}

		if ( ! $this->is_transformable( $value ) ) {
			return $value;
		}

		return $this->transform( $value, $key, $prop_type );
	}
}
