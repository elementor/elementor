<?php
namespace Elementor;

use Elementor\Modules\DynamicTags\Module as TagsModule;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor number control.
 *
 * A base control for creating a number control. Displays a simple number input.
 *
 * @since 1.0.0
 */
class Control_Number extends Base_Data_Control {

	/**
	 * Get number control type.
	 *
	 * Retrieve the control type, in this case `number`.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Control type.
	 */
	public function get_type() {
		return 'number';
	}

	/**
	 * Get number control default settings.
	 *
	 * Retrieve the default settings of the number control. Used to return the
	 * default settings while initializing the number control.
	 *
	 * @since 1.5.0
	 * @access protected
	 *
	 * @return array Control default settings.
	 */
	protected function get_default_settings() {
		return [
			'min' => '',
			'max' => '',
			'step' => '',
			'placeholder' => '',
			'title' => '',
			'dynamic' => [
				'categories' => [ TagsModule::NUMBER_CATEGORY ],
			],
		];
	}

	/**
	 * Render number control output in the editor.
	 *
	 * Used to generate the control HTML in the editor using Underscore JS
	 * template. The variables for the class are available using `data` JS
	 * object.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function content_template() {
		$control_uid = $this->get_control_uid();
		?>
		<div class="elementor-control-field">
			<label for="<?php echo $control_uid; ?>" class="elementor-control-title">{{{ data.label }}}</label>
			<div class="elementor-control-input-wrapper elementor-control-dynamic-switcher-wrapper">
				<input id="<?php echo $control_uid; ?>" type="number" min="{{ data.min }}" max="{{ data.max }}" step="{{ data.step }}" class="tooltip-target elementor-control-tag-area elementor-control-unit-2" data-tooltip="{{ data.title }}" title="{{ data.title }}" data-setting="{{ data.name }}" placeholder="{{ data.placeholder }}" />
			</div>
		</div>
		<# if ( data.description ) { #>
		<div class="elementor-control-field-description">{{{ data.description }}}</div>
		<# } #>
		<?php
	}
}
