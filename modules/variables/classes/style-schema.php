<?php

namespace Elementor\Modules\Variables\Classes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Array_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Union_Prop_Type;
use Elementor\Modules\Variables\PropTypes\Color_Variable_Prop_Type;
use Elementor\Modules\Variables\PropTypes\Font_Variable_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Style_Schema {
	private array $processing_identifiers = [];

	public function augment( array $schema ): array {
		$this->processing_identifiers = [];

		foreach ( $schema as $key => $prop_type ) {
			$schema[ $key ] = $this->update( $prop_type, $key );
		}

		return $schema;
	}

	private function update( $prop_type, $key = null ) {
		$prop_type_id = $this->get_prop_type_identifier( $prop_type, $key );

		if ( in_array( $prop_type_id, $this->processing_identifiers, true ) ) {
			return $prop_type;
		}

		$this->processing_identifiers[] = $prop_type_id;

		$enhanced = apply_filters( 'elementor/variables/enhance_prop_type', $prop_type, $key );

		$prop_type = $enhanced ?? $prop_type;

		$result = $prop_type;

		if ( $prop_type instanceof Union_Prop_Type ) {
			$result = $this->update_union( $prop_type );
		} elseif ( $prop_type instanceof Object_Prop_Type ) {
			$result = $this->update_object( $prop_type );
		} elseif ( $prop_type instanceof Array_Prop_Type ) {
			$result = $this->update_array( $prop_type );
		}

		array_pop( $this->processing_identifiers );

		return $result;
	}

	private function get_prop_type_identifier( $prop_type, $key = null ): string {
		$id = get_class( $prop_type ) . ':' . spl_object_hash( $prop_type );

		return $key ? "$id:$key" : $id;
	}

	private function update_array( Array_Prop_Type $array_prop_type ): Array_Prop_Type {
		return $array_prop_type->set_item_type(
			$this->update( $array_prop_type->get_item_type() )
		);
	}

	private function update_object( Object_Prop_Type $object_prop_type ): Object_Prop_Type {
		return $object_prop_type->set_shape(
			$this->augment( $object_prop_type->get_shape() )
		);
	}

	private function update_union( Union_Prop_Type $union_prop_type ): Union_Prop_Type {
		$new_union = Union_Prop_Type::make();
		$dependencies = $union_prop_type->get_dependencies();
		$new_union->set_dependencies( $dependencies );

		foreach ( $union_prop_type->get_prop_types() as $prop_type ) {
			$updated = $this->update( $prop_type );

			if ( $updated instanceof Union_Prop_Type ) {
				foreach ( $updated->get_prop_types() as $updated_prop_type ) {
					$new_union->add_prop_type( $updated_prop_type );
				}

				continue;
			}

			$new_union->add_prop_type( $updated );
		}

		return $new_union;
	}

	public static function create_union_with_variable_type( $original, string $variable_class ) {
		if ( ! class_exists( $variable_class ) ) {
			throw new \InvalidArgumentException( "Class $variable_class does not exist." );
		}

		if ( ! method_exists( $variable_class, 'make' ) ) {
			throw new \RuntimeException( "Class $variable_class does not have a static make() method." );
		}

		return Union_Prop_Type::create_from( $original )
		    ->add_prop_type( $variable_class::make() );
	}
}
