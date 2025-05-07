<?php

namespace Elementor\Modules\Variables\Classes;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Variables {
	const FILTER = 'elementor/atomic-variables/variables';

	public function get_all() {
		return apply_filters( self::FILTER, [
			'e-gc-001' => [
				'value' => '#ffffff',
				'label' => 'Main: white',
			],
			'e-gc-002' => [
				'value' => '#000000',
				'label' => 'Main: black',
			],
			'e-gc-003' => [
				'value' => '#404040',
				'label' => 'Main: text',
			],

			'e-gc-a01' => [
				'value' => '#FF0000',
				'label' => 'Danger: red',
			],
			'e-gc-a02' => [
				'value' => '#0000FF',
				'label' => 'Informative: blue',
			],
			'e-gc-a03' => [
				'value' => '#FF7BE5',
				'label' => 'Elementor: pink',
			],
			'e-gc-a04' => [
				'value' => '#808080',
				'label' => 'Gray: background',
			],

			'e-gc-b01' => [
				'value' => '#213555',
				'label' => 'Navy: primary',
			],
			'e-gc-b02' => [
				'value' => '#3E5879',
				'label' => 'Navy: secondary',
			],
			'e-gc-b03' => [
				'value' => '#D8C4B6',
				'label' => 'Navy: light',
			],
			'e-gc-b04' => [
				'value' => '#F5EFE7',
				'label' => 'Navy long text variable name: background',
			],

			'e-gc-d01' => [
				'value' => '#123524',
				'label' => 'Green: primary',
			],
			'e-gc-d02' => [
				'value' => '#3E7B27',
				'label' => 'Green: secondary',
			],
			'e-gc-d03' => [
				'value' => '#85A947',
				'label' => 'Green: light',
			],
			'e-gc-d04' => [
				'value' => '#85A947',
				'label' => 'Green: background',
			],

			'e-gc-c01' => [
				'value' => '#3B1E54',
				'label' => 'Violet: primary',
			],
			'e-gc-c02' => [
				'value' => '#9B7EBD',
				'label' => 'Violet: secondary',
			],
			'e-gc-c03' => [
				'value' => '#D4BEE4',
				'label' => 'Violet: light',
			],
			'e-gc-c04' => [
				'value' => '#EEEEEE',
				'label' => 'Violet: background',
			],
		] );
	}
}
