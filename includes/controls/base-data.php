<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

abstract class Base_Data_Control extends Base_Control {

	public function get_default_value() {
		return '';
	}

	public function get_value( $control, $widget ) {
		if ( ! isset( $control['default'] ) ) {
			$control['default'] = $this->get_default_value();
		}

		if ( ! isset( $widget[ $control['name'] ] ) ) {
			return $control['default'];
		}

		return $widget[ $control['name'] ];
	}

	public function get_style_value( $css_property, $control_value ) {
		$res = $control_value;

		// In some locale decimal comma is used instead of decimal point, but that cannot be used in CSS files
		// e.g. Czech, Slovak, Spanish
                if ( is_numeric( $res ) )
                        $res = str_replace( ',', '.', $res );

		return $res;
	}

	protected function get_control_uid( $input_type = 'default' ) {
		return 'elementor-control-' . $input_type . '-{{{ data._cid }}}';
	}
}
