<?php
namespace Elementor\Modules\ControlConverters;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Slider_To_Gaps_Converter implements Command {

	public function execute( $element ) {
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
