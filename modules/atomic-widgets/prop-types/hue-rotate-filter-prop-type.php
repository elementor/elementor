<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Hue_Rotate_Filter_Prop_Type extends Object_Prop_Type {

	public static function get_key(): string {
		return 'hue-rotate';
	}

	protected function define_shape(): array {
		return [
			'hue-rotate' => Size_Prop_Type::make()->default( 0 )->required(),
		];
	}
}
