<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Boolean_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Gap_Prop_Type extends Object_Prop_Type {
	public static function get_key(): string {
		return 'gap';
	}

	protected function define_shape(): array {
		return [
			'isLinked' => Boolean_Prop_Type::make(),
			'column' => Size_Prop_Type::make(),
			'row' => Size_Prop_Type::make(),
		];
	}
}
