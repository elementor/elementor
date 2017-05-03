<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

/**
 * A Code Editor control based on Ace editor. @see https://ace.c9.io/
 *
 * @param string $default        Default code editor content
 * @param array  $language       Any language(mode) supported by Ace editor. @see https://ace.c9.io/build/kitchen-sink.html
 *                               Default 'html'
 *
 * @since 1.0.0
 */
class Control_Code extends Base_Data_Control {

	public function get_type() {
		return 'code';
	}

	protected function get_default_settings() {
		return [
			'label_block' => true,
			'language' => 'html', // html/css
		];
	}

	public function content_template() {
		$control_uid = $this->get_control_uid();
		?>
		<div class="elementor-control-field">
			<label for="<?php echo $control_uid; ?>" class="elementor-control-title">{{{ data.label }}}</label>
			<div class="elementor-control-input-wrapper">
				<textarea id="<?php echo $control_uid; ?>" rows="10" class="elementor-input-style elementor-code-editor" data-setting="{{ data.name }}"></textarea>
			</div>
		</div>
		<# if ( data.description ) { #>
			<div class="elementor-control-field-description">{{{ data.description }}}</div>
		<# } #>
		<?php
	}
}
