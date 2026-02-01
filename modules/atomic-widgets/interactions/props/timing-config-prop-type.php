<?php

namespace Elementor\Modules\AtomicWidgets\Interactions\Props;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Timing_Config_Prop_Type extends Object_Prop_Type {
	public static function get_key(): string {
		return 'timing-config';
	}

	protected function define_shape(): array {
		return [
			'duration' => Number_Prop_Type::make()->description( 'The duration to use for the animation' ),
			'delay' => Number_Prop_Type::make()->description( 'The delay to use for the animation' ),
		];
	}
}
