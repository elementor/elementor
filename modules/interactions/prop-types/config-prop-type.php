<?php

namespace Elementor\Modules\Interactions\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Boolean_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\Interactions\Concerns\Has_Preset;

class Config_Prop_Type extends Object_Prop_Type {
	use Has_Preset;

	public static function get_key(): string {
		return 'config';
	}

	protected function define_shape(): array {
		return [
			'replay' => Boolean_Prop_Type::make(),
			'easing' => String_Prop_Type::make(),
			'relative-to' => String_Prop_Type::make(),
			'offset-top' => Size_Prop_Type::make(),
			'offset-bottom' => Size_Prop_Type::make(),
		];
	}
}
