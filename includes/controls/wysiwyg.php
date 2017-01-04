<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

/**
 * A WordPress WYSIWYG (TinyMCE) editor control.
 *
 * @param string $default     A default value
 *                            Default empty
 *
 * @since 1.0.0
 */
class Control_Wysiwyg extends Control_Base {

	public function get_type() {
		return 'wysiwyg';
	}

	public function content_template() {
		?>
		<label>
			<span class="elementor-control-title">{{{ data.label }}}</span>
			<textarea data-setting="{{ data.name }}"></textarea>
		</label>
		<?php
	}
}
