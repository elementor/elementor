<?php

namespace Elementor\Modules\Interactions\Props;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\Interactions\Presets;
use Elementor\Modules\Interactions\Utils\Prop_Shape_Filter_For_Pro;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Interaction_Item_Prop_Type extends Object_Prop_Type {
	public static function get_key(): string {
		return 'interaction-item';
	}

	protected function define_shape(): array {
		return [
			'interaction_id' => String_Prop_Type::make()->description( 'The interaction id to use for the animation' ),
			'trigger' => String_Prop_Type::make()->meta( 'enum', Presets::triggers_options() )->meta( 'pro', Presets::ADDITIONAL_TRIGGERS )->description( 'The trigger to use for the animation' ),
			'animation' => Animation_Preset_Prop_Type::make()->description( 'The animation to use for the interaction' ),
			'breakpoints' => Interaction_Breakpoints_Prop_Type::make()->description( 'The breakpoints to use for the animation' ),
		];
	}
}
