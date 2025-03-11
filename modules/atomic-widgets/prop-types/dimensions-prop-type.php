<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Boolean_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Dimensions_Prop_Type extends Object_Prop_Type {
	public static function get_key(): string {
		return 'dimensions';
	}

	protected function define_shape(): array {
		return [
			'block-start' => Size_Prop_Type::make(),
			'block-end' => Size_Prop_Type::make(),
			'inline-start' => Size_Prop_Type::make(),
			'inline-end' => Size_Prop_Type::make(),
		];
	}
}
