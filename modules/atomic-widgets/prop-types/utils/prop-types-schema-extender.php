<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes\Utils;

use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Union_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Base\Array_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Transformable_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

abstract class Prop_Types_Schema_Extender {
	public function get_extended_schema( array $schema ): array {
		$result = [];

		foreach ( $schema as $key => $prop_type ) {
			if ( ! ( $prop_type instanceof Prop_Type ) ) {
				$result[ $key ] = $prop_type;

				continue;
			}

			$result[ $key ] = $this->get_extended_prop_type( $prop_type );
		}

		return $result;
	}

	protected function get_extended_prop_type( Prop_Type $prop_type ): Prop_Type {
		if ( ! ( $prop_type instanceof Transformable_Prop_Type || $prop_type instanceof Union_Prop_Type ) ) {
			return $prop_type;
		}

		$transformable_prop_types = $prop_type instanceof Union_Prop_Type ?
			$prop_type->get_prop_types() :
			[ $prop_type ];

		foreach ( $transformable_prop_types as $transformable_prop_type ) {
			if ( $transformable_prop_type instanceof Object_Prop_Type ) {
				$transformable_prop_type->set_shape(
					$this->get_extended_schema( $transformable_prop_type->get_shape() )
				);
			}

			if ( $transformable_prop_type instanceof Array_Prop_Type ) {
				$transformable_prop_type->set_item_type(
					$this->get_extended_prop_type( $transformable_prop_type->get_item_type() )
				);
			}
		}

		$prop_types_to_add = $this->get_prop_types_to_add( $prop_type );

		if ( empty( $prop_types_to_add ) ) {
			return $prop_type;
		}

		$union_prop_type = $prop_type;

		if ( $prop_type instanceof Union_Prop_Type ) {
			$union_prop_type = clone $prop_type;
		} elseif ( $prop_type instanceof Transformable_Prop_Type ) {
			$union_prop_type = Union_Prop_Type::create_from( $prop_type );
		}

		foreach ( $prop_types_to_add as $added_prop_type ) {
			$union_prop_type->add_prop_type( $added_prop_type );
		}

		return $union_prop_type;
	}

	/**
	 * Get the prop types to add to the prop type we extend
	 *
	 * @param Prop_Type $prop_type the prop type we extend
	 */
	abstract protected function get_prop_types_to_add( Prop_Type $prop_type ): array;
}
