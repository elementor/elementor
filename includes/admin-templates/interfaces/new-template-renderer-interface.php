<?php

namespace Elementor;

interface New_Template_Renderer_Interface {

	/**
	 * @param array $control_settings
	 * @return string;
	 */
	public function render( $control_settings);
}
