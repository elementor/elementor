<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Control_WP_Widget extends Control_Base {

	public function get_type() {
		return 'wp_widget';
	}

	public function content_template() {
		?>
		<form action="" method="post">
			<div class="wp-widget-form-loading">Loading..</div>
		</form>
		<?php
	}
}
