<?php

namespace Elementor\Modules\Interactions\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\Interactions\Concerns\Has_Preset;

class Interaction_Item_Prop_Type extends Object_Prop_Type {
	use Has_Preset;

	public static function get_key(): string {
		return 'interaction-item';
	}

	protected function define_shape(): array {

		return [
			'id' => String_Prop_Type::make(),
			'animation' => Animation_Prop_Type::make(),
			'trigger' => String_Prop_Type::make()->enum( self::get_trigger_options() ),
		];
	}

	public static function define_defaults() {
		return [
			'trigger' => String_Prop_Type::generate( 'load' ),
			'animation' => Animation_Prop_Type::define_defaults()
		];
	}

	private static function get_trigger_options() {
		return [
			[
				'value' => 'load',
				'label' => 'Page load'
			],
			[
				'value' => 'scrollIn',
				'label' => 'Scroll into view'
			],
			[
				'value' => 'scrollOn',
				'label' => 'While Scrolling'
			]
		];
	}
}
