<?php

namespace Elementor;

interface New_Template_Renderer_Factory_Interface {
	/**
	 * @param $control
	 * @return mixed
	 */
	public function get_new_template_control_rendered($control);
}
