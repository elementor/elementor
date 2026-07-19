<?php

namespace Elementor\Modules\AtomicWidgets\DynamicTags;

use Elementor\Modules\AtomicWidgets\PropTypes\Utils\Prop_Types_Schema_Extender;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Transformable_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Html_V3_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Image_Src_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Svg_Src_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Url_Prop_Type;
use Elementor\Modules\DynamicTags\Module as V1_Dynamic_Tags_Module;
use Elementor\Modules\AtomicWidgets\PropTypes\Union_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Dynamic_Prop_Types_Mapping extends Prop_Types_Schema_Extender {

	public static function make(): self {
		return new static();
	}

	protected function get_prop_types_to_add( Prop_Type $prop_type ): array {
		$categories = [];

		$transformable_prop_types = $prop_type instanceof Union_Prop_Type ?
			$prop_type->get_prop_types() :
			[ $prop_type ];

		foreach ( $transformable_prop_types as $transformable_prop_type ) {
			if ( $transformable_prop_type instanceof Transformable_Prop_Type ) {
				$categories = array_merge( $categories, $this->get_related_categories( $transformable_prop_type ) );
			}
		}

		if ( empty( $categories ) ) {
			return [];
		}

		$allowed_tag_names = Dynamic_Tags_Module::instance()->get_dynamic_tag_names_by_categories( $categories );

		return [
			Dynamic_Prop_Type::make()
				->categories( $categories )
				->allowed_tag_names( $allowed_tag_names ),
		];
	}

	private function get_related_categories( Transformable_Prop_Type $prop_type ): array {
		if ( ! $prop_type->get_meta_item( Dynamic_Prop_Type::META_KEY, true ) ) {
			return [];
		}

		if ( $prop_type instanceof Number_Prop_Type ) {
			return [ V1_Dynamic_Tags_Module::NUMBER_CATEGORY ];
		}

		if ( $prop_type instanceof Svg_Src_Prop_Type ) {
			return [ V1_Dynamic_Tags_Module::SVG_CATEGORY ];
		}

		if ( $prop_type instanceof Image_Src_Prop_Type ) {
			return [ V1_Dynamic_Tags_Module::IMAGE_CATEGORY ];
		}

		if ( $prop_type instanceof Url_Prop_Type ) {
			return [ V1_Dynamic_Tags_Module::URL_CATEGORY ];
		}

		if ( $prop_type instanceof Html_V3_Prop_Type ) {
			return [ V1_Dynamic_Tags_Module::TEXT_CATEGORY ];
		}

		if ( $prop_type instanceof Color_Prop_Type ) {
			return [ V1_Dynamic_Tags_Module::COLOR_CATEGORY ];
		}

		if ( $prop_type instanceof String_Prop_Type && empty( $prop_type->get_enum() ) ) {
			return [ V1_Dynamic_Tags_Module::TEXT_CATEGORY ];
		}

		return [];
	}
}
