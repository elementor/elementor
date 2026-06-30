<?php

namespace Elementor\Modules\Interactions\Props;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Custom_Effect_Prop_Type extends Object_Prop_Type {
	public static function get_key(): string {
		return 'custom-effect';
	}

	protected function define_shape(): array {
		return [
			'keyframes' => Keyframes_Prop_Type::make()->required(),
		];
	}
}
