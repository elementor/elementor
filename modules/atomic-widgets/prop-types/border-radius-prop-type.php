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
			'start-start' => Size_Prop_Type::make(),
			'start-end' => Size_Prop_Type::make(),
			'end-start' => Size_Prop_Type::make(),
			'end-end' => Size_Prop_Type::make(),
		];
	}
}
