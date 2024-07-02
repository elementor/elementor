<?php

namespace Elementor;

abstract class Widget_Base_V2 extends Widget_Base {
	protected $version = '0.0';

	public function __construct( $data = [], $args = null ) {
		parent::__construct( $data, $args );

		$this->version = $data['version'] ?? '0.0';
	}

	public function get_atomic_controls() {
		return [];
	}

	final public function get_controls( $aaa = null ) {
		return [];
	}

	final public function get_initial_config() {
		$config = parent::get_initial_config();

		$config['atomic_controls'] = $this->get_atomic_controls();
		$config['version'] = $this->version;

		return $config;
	}

	final public function get_data_for_save() {
		$data = parent::get_data_for_save();

		$data['version'] = $this->version;

		return $data;
	}

	final public function get_raw_data( $with_html_content = false ) {
		$data = parent::get_raw_data( $with_html_content );

		$data['styles'] = $this->get_data( 'styles' );

		return $data;
	}

	final public function get_stack( $with_common_controls = true ) {
		return [
			'controls' => [],
			'tabs' => [ 'content' => 'content' ],
		];
	}
}
