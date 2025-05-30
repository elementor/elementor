<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Border_Width_Prop_Type extends Object_Prop_Type {
	public static function get_key(): string {
		return 'border-width';
	}

	protected function define_shape(): array {
		return [
			'block-start' => Size_Prop_Type::make()->required(),
			'block-end' => Size_Prop_Type::make()->required(),
			'inline-start' => Size_Prop_Type::make()->required(),
			'inline-end' => Size_Prop_Type::make()->required(),
		];
	}
}
