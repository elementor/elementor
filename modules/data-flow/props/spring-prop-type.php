<?php

namespace Elementor\Modules\DataFlow\Props;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Spring_Prop_Type extends Object_Prop_Type {
	public static function get_key(): string {
		return 'spring';
	}

	protected function define_shape(): array {
		return [
			'stiffness' => Number_Prop_Type::make()->float()->description( 'Spring stiffness, default 170' ),
			'damping' => Number_Prop_Type::make()->float()->description( 'Spring damping, default 26. Lower values overshoot more' ),
			'mass' => Number_Prop_Type::make()->float()->description( 'Spring mass, default 1' ),
		];
	}
}
