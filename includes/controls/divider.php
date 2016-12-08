<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

/**
 * A UI only control. Show a divider between controls
 *
 * @since 1.0.0
 */
class Control_Divider extends Control_Base {

	public function get_type() {
		return 'divider';
	}

	public function content_template() {
		?>
		<hr />
		<?php
	}
}
