<?php

namespace Elementor\Modules\Interactions\Props;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Movement_Dimensions_Prop_Type extends Object_Prop_Type {
	public static function get_key(): string {
		return 'movement-dimensions';
	}

	protected function define_shape(): array {
		return [
			'x' => Number_Prop_Type::make()->description( 'The x dimension' ),
			'y' => Number_Prop_Type::make()->description( 'The y dimension' ),
			'z' => Number_Prop_Type::make()->description( 'The z dimension' ),
		];
	}
}
