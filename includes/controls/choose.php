<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

/**
 * A Radio Buttons controls.
 *
 * @property array $options   array of arrays `[ [ 'title' => ??, 'icon' => ?? ], [ 'title' ... ]`.
 *                            The icon can be any icon-font class that appears in the panel, e.g. 'fa fa-align-left'
 * @property bool  $toggle    Whether to allow deselect the selected button
 *                            Default true
 * @since 1.0.0
 */
class Control_Choose extends Control_Base {

	public function get_type() {
		return 'choose';
	}

	public function content_template() {
		?>
		<div class="elementor-control-field">
			<label class="elementor-control-title">{{{ data.label }}}</label>
			<div class="elementor-control-input-wrapper">
				<div class="elementor-choices">
					<# _.each( data.options, function( options, value ) { #>
					<input id="elementor-choose-{{ data._cid + data.name + value }}" type="radio" name="elementor-choose-{{ data.name }}" value="{{ value }}">
					<label class="elementor-choices-label tooltip-target" for="elementor-choose-{{ data._cid + data.name + value }}" data-tooltip="{{ options.title }}" title="{{ options.title }}">
						<i class="{{ options.icon }}"></i>
					</label>
					<# } ); #>
				</div>
			</div>
		</div>

		<# if ( data.description ) { #>
		<div class="elementor-control-description">{{{ data.description }}}</div>
		<# } #>
		<?php
	}

	protected function get_default_settings() {
		return [
			'options' => [],
			'label_block' => true,
			'toggle' => true,
		];
	}
}
