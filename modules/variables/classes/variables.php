<?php

namespace Elementor\Modules\Variables\Classes;

use Elementor\Core\Isolation\Wordpress_Adapter_Interface;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Variables {
	const FILTER_NAME = 'elementor/atomic-global-variables/css/variables';

	private $global_variables = [
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

		'e-gc-a01' => [
			'value' => '#123524',
			'label' => 'Green: primary',
		],
		'e-gc-a02' => [
			'value' => '#3E7B27',
			'label' => 'Green: secondary',
		],
		'e-gc-a03' => [
			'value' => '#85A947',
			'label' => 'Green: light',
		],
		'e-gc-a04' => [
			'value' => '#85A947',
			'label' => 'Green: background',
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
			'label' => 'Navy: background',
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
	];

	private Wordpress_Adapter_Interface $wp_adapter;

	public function __construct( Wordpress_Adapter_Interface $wp_adapter ) {
		$this->wp_adapter = $wp_adapter;
	}

	public function get_all() {
		return $this->wp_adapter->apply_filters( self::FILTER_NAME, $this->global_variables );
	}
}
