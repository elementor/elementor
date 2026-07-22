<?php

namespace Elementor\Modules\AtomicWidgets\PlainResolvers;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Array_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Union_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Plain_Values_Resolver {
	private Plain_Resolvers_Registry $registry;

	public function __construct( Plain_Resolvers_Registry $registry ) {
		$this->registry = $registry;
	}

	public function resolve( $plain_value, Prop_Type $prop_type ) {
		if ( null === $plain_value ) {
			return null;
		}

		if ( $this->registry->has( $prop_type::get_key() ) ) {
			return $this->resolve_with_registered( $plain_value, $prop_type );
		}

		if ( $prop_type instanceof Union_Prop_Type ) {
			return $this->resolve_union( $plain_value, $prop_type );
		}

		if ( $prop_type instanceof Object_Prop_Type ) {
			return $this->resolve_object( $plain_value, $prop_type );
		}

		if ( $prop_type instanceof Array_Prop_Type ) {
			return $this->resolve_array( $plain_value, $prop_type );
		}

		return $this->resolve_with_fallback( $plain_value, $prop_type );
	}

	private function resolve_union( $plain_value, Union_Prop_Type $prop_type ) {
		if ( is_array( $plain_value ) && isset( $plain_value['$$type'] ) ) {
			$variant = $prop_type->get_prop_type( $plain_value['$$type'] );

			if ( null === $variant ) {
				return null;
			}

			return $this->resolve( $plain_value['value'] ?? null, $variant );
		}

		$variants = $prop_type->get_prop_types();

		if ( is_int( $plain_value ) || is_float( $plain_value ) ) {
			$variants = $this->prioritize_numeric_variants( $variants );
		}

		foreach ( $variants as $variant ) {
			$result = $this->resolve_variant( $plain_value, $variant );

			if ( null !== $result ) {
				return $result;
			}
		}

		return null;
	}

	private function prioritize_numeric_variants( array $variants ): array {
		$numeric_variants = [];
		$other_variants = [];

		foreach ( $variants as $variant ) {
			if ( Number_Prop_Type::get_key() === $variant::get_key() ) {
				$numeric_variants[] = $variant;
				continue;
			}

			$other_variants[] = $variant;
		}

		return array_merge( $numeric_variants, $other_variants );
	}

	private function resolve_variant( $plain_value, Prop_Type $prop_type ) {
		if ( $this->registry->has( $prop_type::get_key() ) ) {
			return $this->resolve_with_registered( $plain_value, $prop_type );
		}

		if ( $prop_type instanceof Union_Prop_Type ) {
			return $this->resolve_union( $plain_value, $prop_type );
		}

		if ( $prop_type instanceof Object_Prop_Type ) {
			return $this->resolve_object( $plain_value, $prop_type );
		}

		if ( $prop_type instanceof Array_Prop_Type ) {
			return $this->resolve_array( $plain_value, $prop_type );
		}

		return $this->resolve_with_fallback( $plain_value, $prop_type );
	}

	private function resolve_object( $plain_value, Object_Prop_Type $prop_type ) {
		if ( ! is_array( $plain_value ) ) {
			return null;
		}

		$converted = [];

		foreach ( $prop_type->get_shape() as $key => $field_prop_type ) {
			if ( ! array_key_exists( $key, $plain_value ) ) {
				continue;
			}

			$resolved = $this->resolve( $plain_value[ $key ], $field_prop_type );

			if ( null !== $resolved ) {
				$converted[ $key ] = $resolved;
			}
		}

		return $prop_type::generate( $converted );
	}

	private function resolve_array( $plain_value, Array_Prop_Type $prop_type ) {
		if ( ! is_array( $plain_value ) ) {
			return null;
		}

		$item_type = $prop_type->get_item_type();
		$converted = [];

		foreach ( $plain_value as $item ) {
			$resolved = $this->resolve( $item, $item_type );

			if ( null !== $resolved ) {
				$converted[] = $resolved;
			}
		}

		return $prop_type::generate( $converted );
	}

	private function resolve_with_registered( $plain_value, Prop_Type $prop_type ) {
		$resolver = $this->registry->get( $prop_type::get_key() );

		if ( ! ( $resolver instanceof Plain_Resolver_Base ) ) {
			return null;
		}

		$resolved = $resolver->resolve( $plain_value );

		if ( null === $resolved ) {
			return null;
		}

		return $this->normalize_resolver_output( $resolved, $prop_type );
	}

	private function resolve_with_fallback( $plain_value, Prop_Type $prop_type ) {
		$resolver = $this->registry->get( $prop_type::get_key() );

		if ( ! ( $resolver instanceof Plain_Resolver_Base ) ) {
			return null;
		}

		$resolved = $resolver->resolve( $plain_value );

		if ( null === $resolved ) {
			return null;
		}

		return $this->normalize_resolver_output( $resolved, $prop_type );
	}

	private function normalize_resolver_output( $resolved, Prop_Type $prop_type ) {
		if ( is_array( $resolved ) && isset( $resolved['$$type'] ) ) {
			return $resolved;
		}

		return $prop_type::generate( $resolved );
	}
}
