<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class BlurFilter_Prop_Type extends Object_Prop_Type {

	public static function get_key(): string {
		return 'blur';
	}

	protected function define_shape(): array {
		return [
			'radius' => Size_Prop_Type::make()->default( 0 ),
		];
	}
}
