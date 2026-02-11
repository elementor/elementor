<?php

namespace Elementor\Modules\Interactions\Props;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Custom_Effect_Prop_Type extends Object_Prop_Type {
	public static function get_key(): string {
		return 'custom-effect';
	}

	protected function define_shape(): array {
		return [
			'from' => Custom_Effect_Properties_Prop_Type::make()->optional()->description( 'The from state of the custom effect' ),
			'to' => Custom_Effect_Properties_Prop_Type::make()->optional()->description( 'The to state of the custom effect' ),
		];
	}
}
