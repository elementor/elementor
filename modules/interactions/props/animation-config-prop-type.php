<?php

namespace Elementor\Modules\Interactions\Props;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Boolean_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Animation_Config_Prop_Type extends Object_Prop_Type {
	public static function get_key(): string {
		return 'config';
	}

	protected function define_shape(): array {
		return [
			'replay' => Boolean_Prop_Type::make()->description( 'Whether to replay the animation' ),
			'easing' => String_Prop_Type::make()->description( 'The easing function to use for the animation' ),
			'offsetTop' => Number_Prop_Type::make()->description( 'The offset top to use for the animation' ),
			'offsetBottom' => Number_Prop_Type::make()->description( 'The offset bottom to use for the animation' ),
		];
	}
}
