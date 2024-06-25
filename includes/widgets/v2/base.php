<?php

namespace Elementor;

abstract class Widget_Base_V2 extends Widget_Base {
	protected $version = '2.0.0';
	protected $styles = [];

	public function __construct( $data = [], $args = null ) {
		parent::__construct( $data, $args );

		$this->styles = $data['styles'] ?? [];
	}

	public function get_initial_config() {
		$config = parent::get_initial_config();

		$config['controls'] = $this->get_controls();
		$config['version'] = $this->version;

		return $config;
	}

	public function get_data_for_save() {
		$data = parent::get_data_for_save();

		$data['styles'] = $this->styles;
		$data['version'] = $this->version;

		return $data;
	}

	public function get_raw_data( $with_html_content = false ) {
		$data = parent::get_raw_data( $with_html_content );

		$data['styles'] = $this->get_data( 'styles' );

		return $data;
	}

	public function get_stack( $with_common_controls = true ) {
		return [
			'controls' => [],
			'tabs' => [ 'content' => 'content' ],
		];
	}
}
