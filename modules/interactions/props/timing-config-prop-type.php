<?php

namespace Elementor\Modules\Interactions\Props;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Size_Constants;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Time_Size_Prop_Type extends Size_Prop_Type {
	public static function make() {
		return parent::make()->units( Size_Constants::TIME_UNITS )->default_unit( Size_Constants::UNIT_MILLI_SECOND );
	}
}

class Timing_Config_Prop_Type extends Object_Prop_Type {
	public static function get_key(): string {
		return 'timing-config';
	}

	protected function define_shape(): array {
		return [
			'duration' => Time_Size_Prop_Type::make()->description( 'The duration to use for the animation' ),
			'delay' => Time_Size_Prop_Type::make()->description( 'The delay to use for the animation' ),
		];
	}
}
