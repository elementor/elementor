<?php

namespace Elementor\Modules\AtomicWidgets\DynamicTags;

use Elementor\Modules\AtomicWidgets\PropTypes\Image_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\String_Prop_Type;
use Elementor\Modules\DynamicTags\Module as V1_Dynamic_Tags_Module;

class Dynamic_Prop_Types_Mapping {

	/**
	 * @param array<string, Prop_Type> $schema
	 *
	 * @return array<string, Prop_Type>
	 */
	public static function add_to_schema( array $schema ): array {
		foreach ( $schema as $prop ) {
			if ( ! ( $prop instanceof Prop_Type ) ) {
				continue;
			}

			if ( false === $prop->get_meta( 'dynamic' ) ) {
				continue;
			}

			if ( $prop instanceof Number_Prop_Type ) {
				$prop->additional_type(
					Dynamic_Prop_Type::make()->categories( [ V1_Dynamic_Tags_Module::NUMBER_CATEGORY ] )
				);

				continue;
			}

			if ( $prop instanceof Image_Prop_Type ) {
				$prop->additional_type(
					Dynamic_Prop_Type::make()->categories( [ V1_Dynamic_Tags_Module::IMAGE_CATEGORY ] )
				);

				continue;
			}

			if ( $prop instanceof String_Prop_Type && empty( $prop->get_enum() ) ) {
				$prop->additional_type(
					Dynamic_Prop_Type::make()->categories( [ V1_Dynamic_Tags_Module::TEXT_CATEGORY ] )
				);

				continue;
			}
		}

		return $schema;
	}
}
