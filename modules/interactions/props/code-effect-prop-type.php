<?php

namespace Elementor\Modules\Interactions\Props;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Code_Effect_Prop_Type extends Object_Prop_Type {
	const MAX_NAME_LENGTH = 60;

	public static function get_key(): string {
		return 'code-effect';
	}

	protected function define_shape(): array {
		return [
			'name' => String_Prop_Type::make()
				->regex( sprintf( '/^[^\r\n]{1,%d}$/u', self::MAX_NAME_LENGTH ) )
				->description( 'Short label shown in the Interactions tab instead of "Code", describing what the effect does. Imperative, single line, e.g. Add class "is-active", Set attribute aria-expanded, Spring scale on hover' ),
			'code' => Code_Prop_Type::make()
				->required()
				->description( 'Trusted Motion function source: ({ element, params, motion, reducedMotion, event, emit }) => onEnd | animation | void. Runs per element each time the interaction trigger fires; the trigger is wired by Elementor, never by the code. emit( detail ) fires the interaction\'s fires_event, which interactions with trigger "event" and that same event name catch. Read elementor://interactions/motion-code-guide and pick a pattern from elementor://interactions/motion-patterns before writing it' ),
			'params' => Code_Effect_Params_Prop_Type::make()
				->description( 'Editable fields shown in the Interactions tab. Their values reach the code as params.<key>' ),
		];
	}
}
