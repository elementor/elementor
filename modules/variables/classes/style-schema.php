<?php

namespace Elementor\Modules\Variables\Classes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Array_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Union_Prop_Type;
use Elementor\Modules\Variables\PropTypes\Color_Variable as Color_Variable_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Style_Schema {
	public function augment( array $schema ): array {
		$result = [];

		foreach ( $schema as $key => $node ) {
			$result[ $key ] = $this->update( $node );
		}

		return $result;
	}

	private function update( $node ) {
		if ( $node instanceof Color_Prop_Type ) {
			return $this->update_color( $node );
		}

		if ( $node instanceof Union_Prop_Type ) {
			return $this->update_union( $node );
		}

		if ( $node instanceof Object_Prop_Type ) {
			return $this->update_object( $node );
		}

		if ( $node instanceof Array_Prop_Type ) {
			return $this->update_array( $node );
		}

		return $node;
	}

	private function update_color( Color_Prop_Type $node ) {
		return Union_Prop_Type::create_from( $node )
			->add_prop_type( Color_Variable_Prop_Type::make() );
	}

	private function update_array( Array_Prop_Type $node ) {
		return $node->set_item_type(
			$this->update( $node->get_item_type() )
		);
	}

	private function update_object( Object_Prop_Type $node ) {
		return $node->set_shape(
			$this->augment( $node->get_shape() )
		);
	}

	private function update_union( Union_Prop_Type $union ) {
		$new_union = Union_Prop_Type::make();

		foreach ( $union->get_prop_types() as $prop_type ) {
			$updated = $this->update( $prop_type );

			if ( $updated instanceof Union_Prop_Type ) {
				foreach ( $updated->get_prop_types() as $prop_type ) {
					$new_union->add_prop_type( $prop_type );
				}

				continue;
			}

			$new_union->add_prop_type( $prop_type );
		}

		return $new_union;
	}
}
