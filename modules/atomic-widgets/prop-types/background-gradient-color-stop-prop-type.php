<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Array_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;

class Background_Gradient_Color_Stop_Prop_Type extends Array_Prop_Type {
	public static function get_key(): string {
		return 'background-gradient-color-stops';
	}

	protected function define_item_type(): Prop_Type {
		return Color_Stop_Prop_Type::make();
	}
}
