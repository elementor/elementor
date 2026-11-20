<?php

namespace Elementor\Modules\Interactions\Props;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Code_Effect_Prop_Type extends Object_Prop_Type {
	public static function get_key(): string {
		return 'code-effect';
	}

	protected function define_shape(): array {
		return [
			'code' => Code_Prop_Type::make()
				->required()
				->description( 'Trusted Motion function source: ({ element, params, motion, reducedMotion }) => cleanup | void. Runs once per element on load. Read elementor://interactions/motion-code-guide and pick a pattern from elementor://interactions/motion-patterns before writing it' ),
			'params' => Code_Effect_Params_Prop_Type::make()
				->description( 'Editable fields shown in the Interactions tab. Their values reach the code as params.<key>' ),
		];
	}
}
