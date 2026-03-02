<?php

namespace Elementor\Modules\Interactions\Props;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Boolean_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\Interactions\Presets;
use Elementor\Modules\Interactions\Utils\Prop_Shape_Filter_For_Pro;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Animation_Config_Prop_Type extends Object_Prop_Type {
	public static function get_key(): string {
		return 'config';
	}

	protected function define_shape(): array {
		return [
			'replay' => Boolean_Prop_Type::make()->description( 'Whether to replay the animation' ),
			'easing' => String_Prop_Type::make()->description( 'The easing function to use for the animation' ),
			'start' => Number_Prop_Type::make()->description( 'The start to use for the animation' ),
			'end' => Number_Prop_Type::make()->description( 'The end to use for the animation' ),
		];
	}
}
