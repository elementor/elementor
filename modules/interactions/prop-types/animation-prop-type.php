<?php

namespace Elementor\Modules\Interactions\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\Interactions\Concerns\Has_Preset;

class Animation_Prop_Type extends Object_Prop_Type {
	use Has_Preset;

//	protected $presets = [
//		'effect' => 'fade',
//		'effect-type' => 'fade',
//		'direction' => '',
//	];

	public static function get_key(): string {
		return 'animation';
	}

	protected function define_shape(): array {
		return [
			'effect' => String_Prop_Type::make()->enum( self::get_effect_options() ),
			'effect-type' => String_Prop_Type::make(),
			'direction' => String_Prop_Type::make(),
			'timing-config' => Timing_Config_Prop_Type::make(),
			'config' => Config_Prop_Type::make(),
		];
	}

	public static function get_effect_options() {
		return [
			[
				'value' => 'fade',
				'label' => 'Fade'
			],
			[
				'value' => 'slide',
				'label' => 'Slide',
			],
			[
				'value' => 'scale',
				'label' => 'Scale'
			],
		];
	}
}
