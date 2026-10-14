<?php

namespace Elementor\Modules\Interactions\Props;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\Interactions\Presets;
use Elementor\Modules\Interactions\Utils\Prop_Shape_Filter_For_Pro;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Animation_Preset_Prop_Type extends Object_Prop_Type {
	public static function get_key(): string {
		return 'animation-preset-props';
	}

	protected function define_shape(): array {
		return [
			'effect' => String_Prop_Type::make()->meta( 'enum', Presets::effects_options() )->meta( 'pro', Presets::ADDITIONAL_EFFECTS )->description( 'The effect to use for the animation' ),
			'type' => String_Prop_Type::make()->meta( 'enum', Presets::TYPES )->description( 'The type to use for the animation' ),
			'direction' => String_Prop_Type::make()->meta( 'enum', Presets::DIRECTIONS )->description( 'The direction to use for the animation' ),
			'timing_config' => Timing_Config_Prop_Type::make()->description( 'The timing config to use for the animation' ),
			'config' => Animation_Config_Prop_Type::make()->description( 'The config to use for the animation' ),
			'custom_effect' => Custom_Effect_Prop_Type::make()->meta( 'pro', true ),
		];
	}
}
