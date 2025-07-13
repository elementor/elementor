<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Saturate_Filter_Prop_Type extends Object_Prop_Type {

	public static function get_key(): string {
		return 'saturate';
	}

	protected function define_shape(): array {
		return [
			'saturate' => Size_Prop_Type::make()->default( 100 )->required(),
		];
	}
}
