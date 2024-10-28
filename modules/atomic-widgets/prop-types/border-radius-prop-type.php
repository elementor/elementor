<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Border_Radius_Prop_Type extends Object_Prop_Type {
	public static function get_key(): string {
		return 'border-radius';
	}

	protected function define_shape(): array {
		return [
			'top-left' => Size_Prop_Type::make(),
			'top-right' => Size_Prop_Type::make(),
			'bottom-right' => Size_Prop_Type::make(),
			'bottom-left' => Size_Prop_Type::make(),
		];
	}
}
