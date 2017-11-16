<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Switch a controls popover.
 *
 * @param string $label   The label to show
 *
 * @since 1.8.0
 */
class Control_Popover_Toggle extends Base_Data_Control {

	public function get_type() {
		return 'popover_toggle';
	}

	protected function get_default_settings() {
		return [
			'toggle_type' => 'switcher',
			'return_value' => 'yes',
		];
	}

	public function content_template() {
		$control_uid = $this->get_control_uid();
		?>
		<div class="elementor-control-field">
			<label class="elementor-control-title">{{{ data.label }}}</label>
			<div class="elementor-control-input-wrapper">
				<# if ( 'switcher' === data.toggle_type ) { #>
					<div class="elementor-choices">
						<input id="<?php echo $control_uid; ?>-default" type="radio" name="elementor-choose-{{ data.name }}-{{ data._cid }}" value="">
						<label class="elementor-choices-label" for="<?php echo $control_uid; ?>-default"><?php echo __( 'Default', 'elementor' ); ?></label>
						<input id="<?php echo $control_uid; ?>-custom" class="elementor-control-popover-toggle-toggle" type="radio" name="elementor-choose-{{ data.name }}-{{ data._cid }}" value="{{ data.return_value }}">
						<label class="elementor-choices-label elementor-control-popover-toggle-toggle" for="<?php echo $control_uid; ?>-custom"><?php echo __( 'Custom', 'elementor' ); ?></label>
					</div>
				<# } else { #>
					<label class="elementor-control-popover-toggle-toggle elementor-control-popover-toggle-simple-toggle">{{{ data.toggle_title }}}</label>
				<# } #>
			</div>
		</div>
		<?php
	}
}
