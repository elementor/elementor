<?php

namespace Elementor\Modules\Variables\Classes;

use Elementor\Core\Isolation\Wordpress_Adapter_Interface;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Variables {
	const FILTER_NAME = 'elementor/atomic-global-variables/css/variables';

	private $global_variables = [
		'e-atomic-variable-gc-a01' => [
			'value' => '#fff',
			'name' => 'white',
		],
		'e-atomic-variable-gc-a02' => [
			'value' => '#000',
			'name' => 'black',
		],
		'e-atomic-variable-gc-a03' => [
			'value' => '#f00',
			'name' => 'red',
		],
		'e-atomic-variable-gc-a04' => [
			'value' => '#0f0',
			'name' => 'green',
		],
		'e-gv-0001' => [
			'value' => '#F0ABFC',
			'name' => 'Norma-l',
		],
		'e-gv-0002' => [
			'value' => '#E315F5',
			'name' => '1234567890',
		],
		'e-gv-0003' => [
			'value' => '#D004D4',
			'name' => 'muchlongerfocuswithoutspaces',
		],
		'e-gv-0004' => [
			'value' => '#E2E0E2',
			'name' => 'longer text which is much longer',
		],
		'e-gv-0005' => [
			'value' => '#a4b4c4',
			'name' => 'longer text which is much longer-r',
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
