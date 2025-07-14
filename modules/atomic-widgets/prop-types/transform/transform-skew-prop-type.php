<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes\Transform;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Transform_Skew_Prop_Type extends Object_Prop_Type {

	public static function get_key(): string {
		return 'transform-skew';
	}

	protected function define_shape(): array {
		$default = [
			'size' => 0,
			'unit' => 'deg',
		];

		return [
			'x' => Size_Prop_Type::make()->default( $default ),
			'y' => Size_Prop_Type::make()->default( $default ),
		];
	}
}
