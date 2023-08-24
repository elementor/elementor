<?php
namespace Elementor\Modules\ControlConverter;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Module {

	public static function flex_container_gaps_converter( $element ) {
		$breakpoints = array_keys( (array) Plugin::$instance->breakpoints->get_breakpoints() );
		$breakpoints[] = 'desktop';
		$control_name = 'flex_gap';

		foreach ( $breakpoints as $breakpoint ) {
			$control = 'desktop' !== $breakpoint
				? $control_name . '_' . $breakpoint
				: $control_name;

			if ( isset( $element['settings'][ $control ] ) ) {
				$old_size = strval( $element['settings'][ $control ]['size'] );

				$element['settings'][ $control ]['column'] = $old_size;
				$element['settings'][ $control ]['row'] = $old_size;
				$element['settings'][ $control ]['isLinked'] = true;
			}
		}

		return $element;
	}
}
