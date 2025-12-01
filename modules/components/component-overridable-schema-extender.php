<?php

namespace Elementor\Modules\Components;

use Elementor\Modules\AtomicWidgets\PropTypes\Utils\Prop_Types_Schema_Extender;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\Components\PropTypes\Component_Overridable_Prop_Type;
use Elementor\Modules\GlobalClasses\Utils\Atomic_Elements_Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Component_Overridable_Schema_Extender extends Prop_Types_Schema_Extender {
	public static function make(): self {
		return new static();
	}

	protected function get_prop_types_to_add( Prop_Type $prop_type ): array {
		$is_ignore_overridable_applied = ! $prop_type->get_meta_item( Component_Overridable_Prop_Type::META_KEY, true );
		$is_classes_prop = Atomic_Elements_Utils::is_classes_prop( $prop_type );

		if ( $is_ignore_overridable_applied || $is_classes_prop ) {
			return [];
		}
		return [ Component_Overridable_Prop_Type::make()->set_origin_prop_type( $prop_type ) ];
	}
}
