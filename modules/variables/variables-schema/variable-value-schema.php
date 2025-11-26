<?php

namespace Elementor\Modules\Variables\Variables_Schema;

use Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Union_Prop_Type;
use Elementor\Modules\Variables\PropTypes\Color_Variable_Prop_Type;
use Elementor\Modules\Variables\PropTypes\Font_Variable_Prop_Type;

class Variable_Value_Schema {
	public static function get(): array {
		return apply_filters( 'elementor/variables/value-schema', self::schema() );
	}

	private static function schema(): array {
		return [
			Color_Variable_Prop_Type::get_key() => Color_Prop_Type::class,
			Font_Variable_Prop_Type::get_key() => String_Prop_Type::class,
		];
	}
}
