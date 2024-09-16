<?php

namespace Elementor\Modules\AtomicWidgets\DynamicTags;

use Elementor\Modules\AtomicWidgets\PropTypes\Image_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\String_Prop_Type;
use Elementor\Modules\DynamicTags\Module as V1_Dynamic_Tags_Module;

class Dynamic_Prop_Types_Mapping {

	/**
	 * @param array<string, Prop_Type> $prop_types
	 *
	 * @return array<string, Prop_Type>
	 */
	public static function add_to_prop_types_definition( array $prop_types ): array {
		foreach ( $prop_types as $prop_type ) {
			if ( ! ( $prop_type instanceof Prop_Type ) ) {
				continue;
			}

			if ( false === $prop_type->get_meta( 'dynamic' ) ) {
				continue;
			}

			if ( $prop_type instanceof Number_Prop_Type ) {
				$prop_type->additional_type(
					Dynamic_Prop_Type::make()->categories( [ V1_Dynamic_Tags_Module::NUMBER_CATEGORY ] )
				);

				continue;
			}

			if ( $prop_type instanceof Image_Prop_Type ) {
				$prop_type->additional_type(
					Dynamic_Prop_Type::make()->categories( [ V1_Dynamic_Tags_Module::IMAGE_CATEGORY ] )
				);

				continue;
			}

			if ( $prop_type instanceof String_Prop_Type && empty( $prop_type->get_enum() ) ) {
				$prop_type->additional_type(
					Dynamic_Prop_Type::make()->categories( [ V1_Dynamic_Tags_Module::TEXT_CATEGORY ] )
				);

				continue;
			}
		}

		return $prop_types;
	}
}
