<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes\Transform;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Transform_Scale_Prop_Type extends Object_Prop_Type {

	public static function get_key(): string {
		return 'transform-scale';
	}

	protected function define_shape(): array {
		return [
			'x' => Number_Prop_Type::make(),
			'y' => Number_Prop_Type::make(),
			'z' => Number_Prop_Type::make(),
		];
	}
}
