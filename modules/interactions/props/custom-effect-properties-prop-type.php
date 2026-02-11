<?php

namespace Elementor\Modules\Interactions\Props;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Custom_Effect_Properties_Prop_Type extends Object_Prop_Type {
	public static function get_key(): string {
		return 'custom-effect-properties';
	}

	protected function define_shape(): array {
		return [
			'opacity' => Number_Prop_Type::make()->optional()->description( 'The opacity value' ),
			'scale' => Movement_Dimensions_Prop_Type::make()->optional()->description( 'The scale dimensions' ),
			'move' => Movement_Dimensions_Prop_Type::make()->optional()->description( 'The move dimensions' ),
			'rotate' => Movement_Dimensions_Prop_Type::make()->optional()->description( 'The rotate dimensions' ),
			'skew' => Movement_Dimensions_Prop_Type::make()->optional()->description( 'The skew dimensions' ),
		];
	}
}
