<?php

namespace Elementor\Modules\Variables\Classes;

use Elementor\Modules\Variables\PropTypes\Color_Variable_Prop_Type;
use Elementor\Modules\Variables\PropTypes\Font_Variable_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Variables {
	const FILTER = 'elementor/atomic-variables/variables';

	public function get_all() {
		$variables = array_merge( $this->get_color_variables(), $this->get_font_variables() );

		return apply_filters( self::FILTER, $variables );
	}

	private function get_color_variables(): array {
		$type = Color_Variable_Prop_Type::get_key();

		return [
			'e-gc-001' => [
				'type' => $type,
				'value' => '#ffffff',
				'label' => 'Main: white',
			],
			'e-gc-002' => [
				'type' => $type,
				'value' => '#000000',
				'label' => 'Main: black',
			],
			'e-gc-003' => [
				'type' => $type,
				'value' => '#404040',
				'label' => 'Main: text',
			],

			'e-gc-a01' => [
				'type' => $type,
				'value' => '#FF0000',
				'label' => 'Danger: red',
			],
			'e-gc-a02' => [
				'type' => $type,
				'value' => '#0000FF',
				'label' => 'Informative: blue',
			],
			'e-gc-a03' => [
				'type' => $type,
				'value' => '#FF7BE5',
				'label' => 'Elementor: pink',
			],
			'e-gc-a04' => [
				'type' => $type,
				'value' => '#808080',
				'label' => 'Gray: background',
			],

			'e-gc-b01' => [
				'type' => $type,
				'value' => '#213555',
				'label' => 'Navy: primary',
			],
			'e-gc-b02' => [
				'type' => $type,
				'value' => '#3E5879',
				'label' => 'Navy: secondary',
			],
			'e-gc-b03' => [
				'type' => $type,
				'value' => '#D8C4B6',
				'label' => 'Navy: light',
			],
			'e-gc-b04' => [
				'type' => $type,
				'value' => '#F5EFE7',
				'label' => 'Navy long text variable name: background',
			],

			'e-gc-d01' => [
				'type' => $type,
				'value' => '#123524',
				'label' => 'Green: primary',
			],
			'e-gc-d02' => [
				'type' => $type,
				'value' => '#3E7B27',
				'label' => 'Green: secondary',
			],
			'e-gc-d03' => [
				'type' => $type,
				'value' => '#85A947',
				'label' => 'Green: light',
			],
			'e-gc-d04' => [
				'type' => $type,
				'value' => '#85A947',
				'label' => 'Green: background',
			],

			'e-gc-c01' => [
				'type' => $type,
				'value' => '#3B1E54',
				'label' => 'Violet: primary',
			],
			'e-gc-c02' => [
				'type' => $type,
				'value' => '#9B7EBD',
				'label' => 'Violet: secondary',
			],
			'e-gc-c03' => [
				'type' => $type,
				'value' => '#D4BEE4',
				'label' => 'Violet: light',
			],
			'e-gc-c04' => [
				'type' => $type,
				'value' => '#EEEEEE',
				'label' => 'Violet: background',
			],
		];
	}

	private function get_font_variables(): array {
		$type = Font_Variable_Prop_Type::get_key();

		return [
			'e-gf-001' => [
				'type' => $type,
				'value' => 'Almendra SC',
				'label' => 'Almendra',
			],
			'e-gf-002' => [
				'type' => $type,
				'value' => 'Montserrat',
				'label' => 'Montserrat',
			],
			'e-gf-003' => [
				'type' => $type,
				'value' => 'Raleway',
				'label' => 'Raleway',
			],
			'e-gf-004' => [
				'type' => $type,
				'value' => 'ADLaM Display',
				'label' => 'ADLaM',
			],
			'e-gf-005' => [
				'type' => $type,
				'value' => 'Aclonica',
				'label' => 'Aclonica',
			],
			'e-gf-006' => [
				'type' => $type,
				'value' => 'Aguafina Script',
				'label' => 'Aguafina',
			],
			'e-gf-007' => [
				'type' => $type,
				'value' => 'Alfa Slab One',
				'label' => 'Alfa Slab',
			],
			'e-gf-008' => [
				'type' => $type,
				'value' => 'Bruno Ace SC',
				'label' => 'Bruno Ace',
			],
			'e-gf-009' => [
				'type' => $type,
				'value' => 'Bungee Shade',
				'label' => 'Bungee',
			],
			'e-gf-010' => [
				'type' => $type,
				'value' => 'Uncial Antiqua',
				'label' => 'Uncial',
			],
			'e-gf-011' => [
				'type' => $type,
				'value' => 'Vast Shadow',
				'label' => 'Vast',
			],
		];
	}
}
