<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * A private control for native WordPress widgets.
 *
 * @since 1.0.0
 */
class Control_WP_Widget extends Base_Data_Control {

	/**
	 * @since 1.0.0
	 * @access public
	*/
	public function get_type() {
		return 'wp_widget';
	}

	/**
	 * @since 1.4.3
	 * @access public
	*/
	public function get_default_value() {
		return [];
	}

	/**
	 * @since 1.0.0
	 * @access public
	*/
	public function content_template() {
		?>
		<form action="" method="post">
			<div class="wp-widget-form-loading">Loading..</div>
		</form>
		<?php
	}
}
