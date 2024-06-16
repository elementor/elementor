<?php

namespace Elementor;

abstract class Widget_Base_V2 extends Widget_Base {
	abstract public function get_v2_controls();

	function register_transform_section($element_selector = '') {
		return [];
	}

	//  public function get_tabs_controls() {
	//      return [];
	//  }
}
