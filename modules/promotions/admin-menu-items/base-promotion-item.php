<?php

namespace Elementor\Modules\Promotions\AdminMenuItems;

use Elementor\Modules\Promotions\AdminMenuItems\Interfaces\Promotion_Menu_Item;
use Elementor\Settings;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

abstract class Base_Promotion_Item implements Promotion_Menu_Item {

	public function is_visible() {
		return true;
	}

	public function get_parent_slug() {
		return Settings::PAGE_ID;
	}

	public function get_capability() {
		return 'manage_options';
	}

	public function get_cta_text() {
		return esc_html__( 'Upgrade Now', 'elementor' );
	}

	public function get_image_url() {
		return ELEMENTOR_ASSETS_URL . 'images/go-pro-wp-dashboard.svg';
	}

	public function render() {
		?>
		<div class="wrap">
			<div class="elementor-blank_state">
				<img src="<?php echo esc_url( $this->get_image_url() ); ?>" />

				<h2><?php Utils::print_unescaped_internal_string( $this->get_promotion_title() ); ?></h2>

				<p><?php $this->render_promotion_description(); ?></p>

				<a class="elementor-button elementor-button-default elementor-button-go-pro" href="<?php echo esc_url( $this->get_cta_url() ); ?>">
					<?php Utils::print_unescaped_internal_string( $this->get_cta_text() ); ?>
				</a>
			</div>
		</div>
		<?php
	}
}
