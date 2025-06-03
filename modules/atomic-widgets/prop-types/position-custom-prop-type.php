<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Position_Custom_Prop_Type extends Object_Prop_Type {
	public static function get_key(): string {
		return 'position-custom';
	}

	protected function define_shape(): array {
		return [
			'x' => Size_Prop_Type::make(),
			'y' => Size_Prop_Type::make(),
		];
	}
}
