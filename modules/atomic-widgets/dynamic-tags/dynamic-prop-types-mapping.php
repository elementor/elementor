<?php

namespace Elementor\Modules\AtomicWidgets\DynamicTags;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Array_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Persistable_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Image_Src_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Utils\Union_Prop_Type;
use Elementor\Modules\DynamicTags\Module as V1_Dynamic_Tags_Module;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Dynamic_Prop_Types_Mapping {

	public static function make(): self {
		return new static();
	}

	/**
	 * @param array<string, Prop_Type> $schema
	 *
	 * @return array<string, Prop_Type>
	 */
	public function get_modified_prop_types( array $schema ): array {
		$result = [];

		foreach ( $schema as $key => $prop_type ) {
			if ( ! ( $prop_type instanceof Prop_Type ) ) {
				continue;
			}

			$result[ $key ] = $this->get_modified_prop_type( $prop_type );
		}

		return $result;
	}

	private function get_modified_prop_type( Prop_Type $prop_type ) {
		$persistable_prop_types = $prop_type instanceof Union_Prop_Type ?
			$prop_type->get_prop_types() :
			[ $prop_type ];

		$categories = [];

		foreach ( $persistable_prop_types as $p ) {
			if ( $p instanceof Object_Prop_Type ) {
				$p->set_shape(
					$this->get_modified_prop_types( $p->get_shape() )
				);
			}

			if ( $p instanceof Array_Prop_Type ) {
				$p->set_item_type(
					$this->get_modified_prop_type( $p->get_item_type() )
				);
			}

			$categories = array_merge( $categories, $this->get_related_categories( $p ) );
		}

		if ( empty( $categories ) ) {
			return $prop_type;
		}

		$union_prop_type = $prop_type instanceof Persistable_Prop_Type ?
			Union_Prop_Type::create_from( $prop_type ) :
			$prop_type;

		$union_prop_type->add_prop_type(
			Dynamic_Prop_Type::make()->categories( $categories )
		);

		return $union_prop_type;
	}

	private function get_related_categories( Persistable_Prop_Type $prop_type ): array {
		if ( ! $prop_type->get_meta_item( Dynamic_Prop_Type::META_KEY, true ) ) {
			return [];
		}

		if ( $prop_type instanceof Number_Prop_Type ) {
			return [ V1_Dynamic_Tags_Module::NUMBER_CATEGORY ];
		}

		if ( $prop_type instanceof Image_Src_Prop_Type ) {
			return [ V1_Dynamic_Tags_Module::IMAGE_CATEGORY ];
		}

		if ( $prop_type instanceof String_Prop_Type && empty( $prop_type->get_enum() ) ) {
			return [ V1_Dynamic_Tags_Module::TEXT_CATEGORY ];
		}

		return [];
	}
}
