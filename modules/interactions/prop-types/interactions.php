<?php

namespace Elementor\Modules\Interactions\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Array_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Boolean_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\Utils\Utils;

class Interactions extends Array_Prop_Type {
	public static function get_key(): string {
		return 'interactions';
	}

	protected function define_item_type(): Prop_Type {
		return Interaction_Item_Prop_Type::make();
	}

	public function get_default() {
		return Interaction_Item_Prop_Type::generate( [
			'id' => String_Prop_Type::generate( Utils::generate_id( "39934-i-" ) ),
			'trigger' => String_Prop_Type::generate( 'load' ),
			'animation' => Animation_Prop_Type::generate( [
				'effect' => String_Prop_Type::generate( Animation_Prop_Type::get_effect_options()[0]['value'] ),
				'effect-type' => String_Prop_Type::generate( 'in' ),
				'direction' => String_Prop_Type::generate( '' ),
				'timing-config' => Timing_Config_Prop_Type::generate( [
					'duration' => Size_Prop_Type::generate( [
						'size' => 600,
						'unit' => 'ms',
					] ),
					'delay' => Size_Prop_Type::generate( [
						'size' => 0,
						'unit' => 'ms',
					] ),
				] ),
				'config' => Config_Prop_Type::generate( [
					'replay' => Boolean_Prop_Type::generate( false ),
					'easing' => String_Prop_Type::generate( 'no-sure' ),
					'relative-to' => String_Prop_Type::generate( 'no-sure' ),
					'offset-top' => Size_Prop_Type::generate( [
						'size' => 90,
						'unit' => '%'
					] ),
					'offset-bottom' => Size_Prop_Type::generate( [
						'size' => 100,
						'unit' => '%'
					] ),
				] )
			] ),
		] );
	}
}
