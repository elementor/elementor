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
			'e-gc-004' => [
				'value' => '#00000033',
				'label' => 'Main: overlay',
			],
		] );
	}
}
