<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

/**
 * A group of Dimensions settings (Top, Right, Bottom, Left) With the option to link them together
 *
 * @param array  $default {
 * 		@type integer       $top                     Default empty
 * 		@type integer       $right                   Default empty
 * 		@type integer       $bottom                  Default empty
 * 		@type integer       $left                    Default empty
 * 		@type string        $unit                    The selected CSS Unit. 'px', '%', 'em'
 * 		                               				 Default 'px'
 * 		@type bool          $isLinked                Whether to link them together ( prevent set different values )
 * 		                               				 Default true
 * }
 *
 * @param array        $size_units              Array of available CSS Units like 'px', '%', 'em'
 *                                              Default [ 'px' ]
 * @param array|string $allowed_dimensions      Which fields to show, 'all' | 'horizontal' | 'vertical' | [ 'top', 'left' ... ]
 *                                              Default 'all'
 * @param array  $range {
 *     {
 * 		@type integer $min        The minimum value of range
 * 		@type integer $max        The maximum value of range
 * 		@type integer $step       The interval that the slider moves on
 *    },
 *    ...
 * }
 *
 * The range param is default populated with ranges for px|em|rem|%|deg @see Control_Base_Units::get_default_settings()
 *
 * @since                         1.0.0
 */
abstract class Control_Base_Units extends Control_Base_Multiple {

	public function get_default_value() {
		return [
			'unit' => 'px',
		];
	}

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
			],
		];
	}

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
