<?php

namespace Elementor\Modules\Components;

use Elementor\Modules\AtomicWidgets\PropTypes\Utils\Prop_Types_Schema_Extender;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\Components\PropTypes\Component_Overridable_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Component_Overridable_Schema_Extender extends Prop_Types_Schema_Extender {
	public static function make(): self {
		return new static();
	}

	protected function get_prop_types_to_add( Prop_Type $prop_type, array $nested_prop_types ): array {
		if ( ! $prop_type->get_meta_item( Component_Overridable_Prop_Type::META_KEY, true ) ) {
			return [];
		}

		return [ Component_Overridable_Prop_Type::make()->set_origin_prop_type( $prop_type ) ];
	}
}
