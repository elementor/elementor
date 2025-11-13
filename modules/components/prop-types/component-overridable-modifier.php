<?php

namespace Elementor\Modules\Components\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Utils\Prop_Types_Schema_Modifier;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Component_Overridable_Schema_Modifier extends Prop_Types_Schema_Modifier {
	protected function get_prop_types_to_add( Prop_Type $prop_type ): array {
		return [ Component_Overridable_Prop_Type::make()->set_default_type( $prop_type::get_key() ) ];
	}
}
