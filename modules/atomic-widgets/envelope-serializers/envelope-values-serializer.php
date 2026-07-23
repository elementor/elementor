<?php

namespace Elementor\Modules\AtomicWidgets\EnvelopeSerializers;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Array_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Union_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Envelope_Values_Serializer {
	private Envelope_Serializers_Registry $registry;

	public function __construct( Envelope_Serializers_Registry $registry ) {
		$this->registry = $registry;
	}

	public function serialize_map( array $settings, array $props_schema ): array {
		$plain = [];

		foreach ( $settings as $key => $value ) {
			if ( ! isset( $props_schema[ $key ] ) || ! $props_schema[ $key ] instanceof Prop_Type ) {
				continue;
			}

			$serialized = $this->serialize( $value, $props_schema[ $key ] );

			if ( null !== $serialized ) {
				$plain[ $key ] = $serialized;
			}
		}

		return $plain;
	}

	public function serialize( $envelope_value, Prop_Type $prop_type ) {
		if ( null === $envelope_value ) {
			return null;
		}

		$type_key = $prop_type::get_key();

		if ( $type_key && $this->registry->has( $type_key ) ) {
			return $this->serialize_with_registered( $envelope_value, $type_key );
		}

		if ( $prop_type instanceof Union_Prop_Type ) {
			return $this->serialize_union( $envelope_value, $prop_type );
		}

		if ( $prop_type instanceof Object_Prop_Type ) {
			return $this->serialize_object( $envelope_value, $prop_type );
		}

		if ( $prop_type instanceof Array_Prop_Type ) {
			return $this->serialize_array( $envelope_value, $prop_type );
		}

		return $this->serialize_leaf( $envelope_value );
	}

	private function serialize_union( $envelope_value, Union_Prop_Type $prop_type ) {
		if ( ! is_array( $envelope_value ) || ! isset( $envelope_value['$$type'] ) ) {
			return null;
		}

		$variant = $prop_type->get_prop_type( $envelope_value['$$type'] );

		if ( null === $variant ) {
			return null;
		}

		return $this->serialize( $envelope_value, $variant );
	}

	private function serialize_object( $envelope_value, Object_Prop_Type $prop_type ) {
		$inner = $this->unwrap_envelope( $envelope_value );

		if ( ! is_array( $inner ) ) {
			return null;
		}

		$plain = [];

		foreach ( $prop_type->get_shape() as $key => $field_prop_type ) {
			if ( ! array_key_exists( $key, $inner ) ) {
				continue;
			}

			$serialized = $this->serialize( $inner[ $key ], $field_prop_type );

			if ( null !== $serialized ) {
				$plain[ $key ] = $serialized;
			}
		}

		return $plain;
	}

	private function serialize_array( $envelope_value, Array_Prop_Type $prop_type ) {
		$inner = $this->unwrap_envelope( $envelope_value );

		if ( ! is_array( $inner ) ) {
			return null;
		}

		$item_type = $prop_type->get_item_type();
		$plain = [];

		foreach ( $inner as $item ) {
			$serialized = $this->serialize( $item, $item_type );

			if ( null !== $serialized ) {
				$plain[] = $serialized;
			}
		}

		return $plain;
	}

	private function serialize_leaf( $envelope_value ) {
		if ( is_array( $envelope_value ) && isset( $envelope_value['$$type'] ) && array_key_exists( 'value', $envelope_value ) ) {
			return $envelope_value['value'];
		}

		return $envelope_value;
	}

	private function serialize_with_registered( $envelope_value, string $type_key ) {
		$serializer = $this->registry->get( $type_key );

		if ( ! ( $serializer instanceof Envelope_Serializer_Base ) ) {
			return null;
		}

		return $serializer->serialize( $envelope_value );
	}

	private function unwrap_envelope( $value ) {
		if ( is_array( $value ) && isset( $value['$$type'] ) && array_key_exists( 'value', $value ) ) {
			return $value['value'];
		}

		return $value;
	}
}
