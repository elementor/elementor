<?php

namespace Elementor;

abstract class Widget_Base_V2 extends Widget_Base {
	abstract public function get_v2_controls(): array;

	abstract public function get_props(): array;

	abstract public function get_styles(): array;

	public function get_initial_config()
	{
		$config =  parent::get_initial_config();

		$config[ 'controls' ] = $this->get_v2_controls();
		$config[ 'props' ] = $this->get_props();
		$config[ 'styles' ] = $this->get_styles();

		return $config;
	}

	public function get_data_for_save() {
		$data = parent::get_data_for_save();

 		$data['styles'] = $this->get_styles();
		$data['props'] = $this->get_props();

		return $data;
	}

	public function get_stack($with_common_controls = true) {
		return [
			'controls' => [],
			'tabs' => [],
		];
	}
}
