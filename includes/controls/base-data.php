<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

abstract class Base_Data_Control extends Base_Control {

	public function get_default_value() {
		return '';
	}

	public function get_value( $control, $widget ) {
		if ( ! isset( $control['default'] ) )
			$control['default'] = $this->get_default_value();

		if ( ! isset( $widget[ $control['name'] ] ) )
			return $control['default'];

		return $widget[ $control['name'] ];
	}

	public function get_style_value( $css_property, $control_value ) {
		return $control_value;
	}

	protected function get_control_uid( $input_type = 'default' ) {
		return 'elementor-control-' . $input_type . '-{{{ data._cid }}}';
	}
}
