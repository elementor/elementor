<?php

namespace Elementor\Modules\Promotions\MenuItems;

use Elementor\Modules\Promotions\MenuItems\Interfaces\Promotion_Menu_Item;
use Elementor\Settings;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

abstract class Base_Promotion_Item implements Promotion_Menu_Item {

	public function is_visible() {
		return true;
	}

	public function parent_slug() {
		return Settings::PAGE_ID;
	}

	public function position() {
		return null;
	}

	public function capability() {
		return 'manage_options';
	}

	public function cta_text() {
		return esc_html__( 'Upgrade Now', 'elementor' );
	}

	public function image_url() {
		return ELEMENTOR_ASSETS_URL . 'images/go-pro-wp-dashboard.svg';
	}

	public function callback() {
		?>
		<div class="wrap">
			<div class="elementor-blank_state">
				<img src="<?php echo esc_url( $this->image_url() ); ?>" />

				<h2><?php Utils::print_unescaped_internal_string( $this->promotion_title() ); ?></h2>

				<p><?php $this->promotion_description(); ?></p>

				<a class="elementor-button elementor-button-default elementor-button-go-pro" target="_blank" href="<?php echo esc_url( $this->cta_url() ); ?>">
					<?php Utils::print_unescaped_internal_string( $this->cta_text() ); ?>
				</a>
			</div>
		</div>
		<?php
	}
}
