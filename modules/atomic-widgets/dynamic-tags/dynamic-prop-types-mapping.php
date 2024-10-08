<?php

namespace Elementor\Modules\AtomicWidgets\DynamicTags;

use Elementor\Modules\AtomicWidgets\PropTypes\Image_Src_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Transformable_Prop_Type;
use Elementor\Modules\DynamicTags\Module as V1_Dynamic_Tags_Module;

class Dynamic_Prop_Types_Mapping {

	public static function make(): self {
		return new static();
	}

	/**
	 * @param array<string, Prop_Type> $schema
	 *
	 * @return array<string, Prop_Type>
	 */
	public function add_to_schema( array $schema ): array {
		foreach ( $schema as $prop ) {
			if ( ! ( $prop instanceof Prop_Type ) ) {
				continue;
			}

			$this->add_to_prop_type( $prop );

			if ( $prop instanceof Transformable_Prop_Type ) {
				foreach ( $prop->get_internal_types() as $internal_prop ) {
					$this->add_to_prop_type( $internal_prop );
				}
			}
		}

		return $schema;
	}

	private function add_to_prop_type( Prop_Type $prop_type ): void {
		if ( false === $prop_type->get_meta( 'dynamic' ) ) {
			return;
		}

		if ( $prop_type instanceof Number_Prop_Type ) {
			$prop_type->additional_type(
				Dynamic_Prop_Type::make()->categories( [ V1_Dynamic_Tags_Module::NUMBER_CATEGORY ] )
			);

			return;
		}

		if ( $prop_type instanceof Image_Src_Prop_Type ) {
			$prop_type->additional_type(
				Dynamic_Prop_Type::make()->categories( [ V1_Dynamic_Tags_Module::IMAGE_CATEGORY ] )
			);

			return;
		}

		if ( $prop_type instanceof String_Prop_Type && empty( $prop_type->get_enum() ) ) {
			$prop_type->additional_type(
				Dynamic_Prop_Type::make()->categories( [ V1_Dynamic_Tags_Module::TEXT_CATEGORY ] )
			);

			return;
		}
	}
}
