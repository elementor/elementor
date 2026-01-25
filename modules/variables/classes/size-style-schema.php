<?php

namespace Elementor\Modules\Variables\Classes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Array_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Union_Prop_Type;
use Elementor\Modules\Variables\PropTypes\Size_Variable_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Size_Style_Schema {
	private $blacklist = [
		'box-shadow',
		'filter',
		'backdrop-filter',
		'transform',
		'transition',
	];

	private function ignore( $css_property ): bool {
		if ( in_array( $css_property, $this->blacklist, true ) ) {
			return true;
		}

		return false;
	}

	public function augment( array $schema ): array {
		foreach ( $schema as $css_property => $prop_type ) {
			if ( $this->ignore( $css_property ) ) {
				continue;
			}

			$schema[ $css_property ] = $this->update( $prop_type );
		}

		return $schema;
	}

	private function update( $prop_type ) {
		if ( $prop_type instanceof Size_Prop_Type ) {
			return $this->update_size( $prop_type );
		}

		if ( $prop_type instanceof Union_Prop_Type ) {
			return $this->update_union( $prop_type );
		}

		if ( $prop_type instanceof Object_Prop_Type ) {
			return $this->update_object( $prop_type );
		}

		if ( $prop_type instanceof Array_Prop_Type ) {
			return $this->update_array( $prop_type );
		}

		return $prop_type;
	}

	private function update_size( Size_Prop_Type $size_prop_type ): Union_Prop_Type {
		return Union_Prop_Type::create_from( $size_prop_type )
			->add_prop_type( Size_Variable_Prop_Type::make() );
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
		foreach ( $union_prop_type->get_prop_types() as $prop_type ) {
			$updated = $this->update( $prop_type );

			if ( $updated instanceof Union_Prop_Type ) {
				foreach ( $updated->get_prop_types() as $updated_prop_type ) {
					$union_prop_type->add_prop_type( $updated_prop_type );
				}
			}
		}

		return $union_prop_type;
	}
}
