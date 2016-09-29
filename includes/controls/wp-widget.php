<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Control_WP_Widget extends Control_Base {

	public function get_type() {
		return 'wp_widget';
	}

	public function content_template() {
		?>
		<div id="elementor-update-preview">
			<div id="elementor-update-preview-title"><?php echo __( 'Update changes to page', 'elementor' ); ?></div>
			<div id="elementor-update-preview-button-wrapper">
				<button id="elementor-update-preview-button" class="elementor-button elementor-button-success"><?php echo __( 'Apply', 'elementor' ); ?></button>
			</div>
		</div>
		<form action="" method="post">
			<div class="wp-widget-form-loading">Loading..</div>
		</form>
		<?php
	}
}
