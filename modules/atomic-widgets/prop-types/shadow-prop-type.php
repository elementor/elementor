<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Shadow_Prop_Type extends Object_Prop_Type {
	public static function get_key(): string {
		return 'shadow';
	}

	protected function define_shape(): array {
		return [
			'hOffset' => Size_Prop_Type::make()->required(),
			'vOffset' => Size_Prop_Type::make()->required(),
			'blur' => Size_Prop_Type::make()->required(),
			'spread' => Size_Prop_Type::make()->required(),
			'color' => Color_Prop_Type::make()->required(),
			'position' => String_Prop_Type::make()->enum( [ 'inset' ] ),
		];
	}
}
