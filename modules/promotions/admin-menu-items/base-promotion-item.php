<?php

namespace Elementor\Modules\Promotions\AdminMenuItems;

use Elementor\Core\Utils\Promotions\Validate_Promotion;
use Elementor\Modules\Promotions\AdminMenuItems\Interfaces\Promotion_Menu_Item;
use Elementor\Settings;

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
		$config = [
			"upsale_data" => [
				'title' => $this->get_promotion_title(),
				'description' => $this->render_promotion_description(),
				'image' => $this->get_image_url(),
				'upgrade_text' => $this->get_cta_text(),
				'upgrade_url' => $this->get_cta_url(),
			]
		];

		$config['upsale_data'] = apply_filters( 'elementor/' . $this->get_name() . '/restrictions/custom_promotion', $config['upsale_data'] ) ?? $this->get_upsale_data();

		if ( isset( $config['upsale_data']['upgrade_url'] ) && false === Validate_Promotion::domain_is_on_elementor_dot_com( $config['upsale_data']['upgrade_url'] ) ) {
			$config['upsale_data']['upgrade_url'] = esc_url( $this->get_cta_url()['upgrade_url'] );
		}

		?>
		<div class="wrap">
			<div class="elementor-blank_state">
				<img src="<?php echo esc_url( ELEMENTOR_ASSETS_URL . $config['upsale_data']['image'] ?? $this->get_image_url() ); ?>" loading="lazy" />

				<h3><?php echo esc_html__( $config['upsale_data']['title'] ?? $this->get_promotion_title() ); ?></h3>

				<p><?php echo esc_html__( $config['upsale_data']['description'] ?? $this->render_promotion_description() ) ?></p>

				<a class="elementor-button go-pro" href="<?php echo esc_url( $config['upsale_data']['upgrade_url'] ); ?>">
					<?php echo esc_html__( $config['upsale_data']['upgrade_text'] ?? $this->get_cta_text() ); ?>
				</a>
			</div>
		</div>
		<?php
	}
}
