<?php

namespace Elementor\Modules\DataFlow\Props;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Range_Map_Prop_Type extends Object_Prop_Type {
	public static function get_key(): string {
		return 'range-map';
	}

	protected function define_shape(): array {
		return [
			'in_min' => Number_Prop_Type::make()->float()->required()->description( 'Start of the input range' ),
			'in_max' => Number_Prop_Type::make()->float()->required()->description( 'End of the input range' ),
			'out_min' => Number_Prop_Type::make()->float()->required()->description( 'Value written when the input is at in_min' ),
			'out_max' => Number_Prop_Type::make()->float()->required()->description( 'Value written when the input is at in_max' ),
		];
	}
}
