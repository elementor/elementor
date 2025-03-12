<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;

class Background_Gradient_Overlay_Prop_Type extends Object_Prop_Type {
	public static function get_key(): string {
		return 'background-gelementorV2radient-overlay';
	}

	protected function define_shape(): array {
		return [
			'type' => String_Prop_Type::make()->enum( [ 'linear', 'radial' ] ),
			'angle' => Number_Prop_Type::make(),
			'stops' => Background_Gradient_Color_Stop_Prop_Type::make(),
			'positions' => Background_Gradient_Radial_Position_Prop_Type::make(),
		];
	}
}


