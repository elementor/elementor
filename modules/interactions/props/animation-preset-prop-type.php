<?php

namespace Elementor\Modules\Interactions\Props;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Animation_Preset_Prop_Type extends Object_Prop_Type {
	public static function get_key(): string {
		return 'animation-preset-props';
	}

	protected function define_shape(): array {
		return [
			'effect' => String_Prop_Type::make()->description( 'The effect to use for the animation' ),
			'custom' => Custom_Effect_Prop_Type::make()->description( 'The custom effect definition' ),
			'type' => String_Prop_Type::make()->enum( [
				'in',
				'out',
			] )->description( 'The type to use for the animation' ),
			'direction' => String_Prop_Type::make()->description( 'The direction to use for the animation' ),
			'timing_config' => Timing_Config_Prop_Type::make()->description( 'The timing config to use for the animation' ),
			'config' => Animation_Config_Prop_Type::make()->description( 'The config to use for the animation' ),
		];
	}
}
