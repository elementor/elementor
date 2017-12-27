<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor WordPress widget control.
 *
 * A base control for creating WordPress widget control. Displays native
 * WordPress widgets. This a private control for internal use.
 *
 * Creating new control in the editor (inside `Widget_Base::_register_controls()`
 * method):
 *
 *    $this->add_control(
 *    	'wp',
 *    	[
 *    		'label' => __( 'Form', 'plugin-domain' ),
 *    		'type' => Controls_Manager::WP_WIDGET,
 *    		'widget' => "wp-widget-{$widget_id_base}",
 *    		'id_base' => $widget_id_base,
 *    	]
 *    );
 *
 * @since 1.0.0
 */
class Control_WP_Widget extends Base_Data_Control {

	/**
	 * Retrieve WordPress widget control type.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Control type.
	 */
	public function get_type() {
		return 'wp_widget';
	}

	/**
	 * Retrieve WordPress widget control default values.
	 *
	 * Get the default value of the WordPress widget control. Used to return the
	 * default values while initializing the WordPress widget control.
	 *
	 * @since 1.4.3
	 * @access public
	 *
	 * @return array Control default value.
	 */
	public function get_default_value() {
		return [];
	}

	/**
	 * Render WordPress widget control output in the editor.
	 *
	 * Used to generate the control HTML in the editor using Underscore JS
	 * template. The variables for the class are available using `data` JS
	 * object.
	 *
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
