<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor base units control.
 *
 * A base control for creating unit control.
 *
 * @since 1.0.0
 * @abstract
 *
 * @param array $default {
 *     Optional. Defautl unit values.
 *
 *     @type int    $top      Optional. Top unit. Default is empty.
 *     @type int    $right    Optional. Right unit. Default is empty.
 *     @type int    $bottom   Optional. Bottom unit. Default is empty.
 *     @type int    $left     Optional. Left unit. Default is empty.
 *     @type string $unit     Optional. The CSS unit type. Available units are
 *                            '%', 'px', 'em', 'rem' or 'deg'. Default is 'px'.
 *     @type bool   $isLinked Optional. Whether to link all the values together
 *                            or not. Used to prevent setting different values
 *                            foreach unit location (top, right, bottom,
 *                            left). Default is True, all the unit are linked.
 * }
 * @param array $size_units                Optional. An array of available CSS
 *                                         units like 'px', '%' and 'em'.
 *                                         Default is [ 'px' ].
 * @param array|string $allowed_dimensions Optional. Which fields to show.
 *                                         Available values are 'all',
 *                                         'horizontal', 'vertical',
 *                                         [ 'top', 'left' ... ]. Default is 'all'.
 * @param array $range {
 *     The range parameter is populated by default with ranges for each register
 *     size (e.g. px|em|rem|%|deg). @see Control_Base_Units::get_default_settings()
 *
 *     {
 *      @type integer $min  Optional. The minimum value of range.
 *      @type integer $max  Optional. The maximum value of range.
 *      @type integer $step Optional. The intervals value that will be incremented
 *                          or decremented when using the controls' spinners.
 *     },
 *     ...
 * }
 */
abstract class Control_Base_Units extends Control_Base_Multiple {

	/**
	 * Retrieve units control default value.
	 *
	 * Get the default value of the units control. Used to return the default
	 * values while initializing the units control.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return array Control default value.
	 */
	public function get_default_value() {
		return [
			'unit' => 'px',
		];
	}

	/**
	 * Retrieve units control default settings.
	 *
	 * Get the default settings of the units control. Used to return the default
	 * settings while initializing the units control.
	 *
	 * @since 1.0.0
	 * @access protected
	 *
	 * @return array Control default settings.
	 */
	protected function get_default_settings() {
		return [
			'size_units' => [ 'px' ],
			'range' => [
				'px' => [
					'min' => 0,
					'max' => 100,
					'step' => 1,
				],
				'em' => [
					'min' => 0.1,
					'max' => 10,
					'step' => 0.1,
				],
				'rem' => [
					'min' => 0.1,
					'max' => 10,
					'step' => 0.1,
				],
				'%' => [
					'min' => 0,
					'max' => 100,
					'step' => 1,
				],
				'deg' => [
					'min' => 0,
					'max' => 360,
					'step' => 1,
				],
				'vh' => [
					'min' => 0,
					'max' => 100,
					'step' => 1,
				],
			],
		];
	}

	/**
	 * Print units control settings.
	 *
	 * Used to generate the units control template in the editor.
	 *
	 * @since 1.0.0
	 * @access protected
	 */
	protected function print_units_template() {
		?>
		<# if ( data.size_units.length > 1 ) { #>
		<div class="elementor-units-choices">
			<# _.each( data.size_units, function( unit ) { #>
			<input id="elementor-choose-{{ data._cid + data.name + unit }}" type="radio" name="elementor-choose-{{ data.name }}" data-setting="unit" value="{{ unit }}">
			<label class="elementor-units-choices-label" for="elementor-choose-{{ data._cid + data.name + unit }}">{{{ unit }}}</label>
			<# } ); #>
		</div>
		<# } #>
		<?php
	}
}
