<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor Visual Choice control.
 *
 * This control extends the base Choose control allowing the user to choose between options represented by SVG or Image.
 *
 * @since 1.0.0
 */
class Control_Visual_Choice extends Base_Data_Control {

	public function get_type() {
		return 'visual_choice';
	}

	public function content_template() {
		$control_uid_input_type = '{{value}}';
		?>
		<div class="elementor-control-field">
			<label class="elementor-control-title">{{{ data.label }}}</label>
			<div class="elementor-control-input-wrapper">
				<div class="elementor-visual-choice-choices" style="--elementor-visual-choice-columns: {{ data.columns }};">

					<# _.each( data.options, function( options, value ) { #>
					<div class="elementor-visual-choice-element">
						<input id="<?php $this->print_control_uid( $control_uid_input_type ); ?>" type="radio" name="elementor-visual-choice-{{ data.name }}-{{ data._cid }}" value="{{ value }}">
						<label class="elementor-visual-choice-label tooltip-target" for="<?php $this->print_control_uid( $control_uid_input_type ); ?>" data-tooltip="{{ options.title }}" title="{{ options.title }}">
							<img class="elementor-visual-choice-image" src="{{ options.image }}" aria-hidden="true" alt="{{ options.title }}" data-hover="{{ value }}" />
							<span class="elementor-screen-only">{{{ options.title }}}</span>
						</label>
					</div>
					<# } ); #>
				</div>
			</div>
		</div>

		<# if ( data.description ) { #>
			<div class="elementor-control-field-description">{{{ data.description }}}</div>
		<# } #>
		<?php
	}

	/**
	 * Get default settings.
	 *
	 * Retrieve the default settings of the control. Used to return the default settings
	 * while initializing the control.
	 *
	 * @since 1.0.0
	 * @access protected
	 *
	 * @return array Control default settings.
	 * * - 'options' (array): An array of options for the control. Instead of 'icon', it uses the field 'image'.
	 * * - 'toggle' (bool): Whether the control should toggle between options.
	 * * - 'columns' (int): The number of columns to display the options in.
 */
	protected function get_default_settings() {
		return [
			'options' => [],
			'toggle' => true,
			'columns' => 1,
		];
	}
}
