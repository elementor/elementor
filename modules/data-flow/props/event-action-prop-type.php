<?php

namespace Elementor\Modules\DataFlow\Props;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\DataFlow\State_Params;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Event_Action_Prop_Type extends Object_Prop_Type {
	const STATE_EVENT = 'state';
	const EVENTS = [
		'load',
		'click',
		'dblclick',
		'pointerenter',
		'pointerleave',
		'pointerdown',
		'pointerup',
		'focus',
		'blur',
		'input',
		'change',
		'submit',
		self::STATE_EVENT,
	];

	public static function get_key(): string {
		return 'event-action';
	}

	protected function define_shape(): array {
		return [
			'on' => String_Prop_Type::make()->enum( self::EVENTS )->required()->description( 'DOM event on the element, "load" once on page load, or "state" when the state key changes' ),
			'key' => String_Prop_Type::make()->regex( State_Params::KEY_PATTERN )->description( 'State key to watch when "on" is "state"' ),
			'action' => Action_Call_Prop_Type::make()->required()->description( 'The action to run' ),
		];
	}

	protected function validate_value( $value ): bool {
		if ( ! parent::validate_value( $value ) ) {
			return false;
		}

		$event = $value['on']['value'] ?? null;

		return self::STATE_EVENT !== $event || ! empty( $value['key']['value'] );
	}
}
