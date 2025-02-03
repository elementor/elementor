<?php

namespace Elementor\Modules\AtomicGlobalVariables\Classes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Array_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;

class Stub_Array_Of_Colors_Prop_Type extends Array_Prop_Type {
	public static function get_key(): string {
		return 'stub-array-prop-type';
	}

	public function define_item_type(): Prop_Type {
		return Color_Prop_Type::make();
	}
}
