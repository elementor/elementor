<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Stroke_Prop_Type extends Object_Prop_Type {
	public static function get_key(): string {
		return 'stroke';
	}

	protected function define_shape(): array {
		return [
			'color' => Color_Prop_Type::make(),
			'width' => Size_Prop_Type::make(),
		];
	}
}
