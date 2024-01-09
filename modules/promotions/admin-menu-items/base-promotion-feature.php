<?php

namespace Elementor\Modules\Promotions\AdminMenuItems;

use Elementor\Modules\Promotions\AdminMenuItems\Interfaces\Promotion_Menu_Item;
use Elementor\Settings;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

abstract class Base_Promotion_Feature implements Promotion_Menu_Item {

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
			<div class="e-feature-promotion_flex">
				<div class="e-feature-promotion_data">
					<h3><?php Utils::print_unescaped_internal_string( $this->get_promotion_title() ); ?></h3>

					<ul>
						<li>asdfasdfasdf</li>
						<li>asdfasdfasdf</li>
						<li>asdfasdfasdf</li>
						<li>asdfasdfasdf</li>
						<li>asdfasdfasdf</li>
						<li>asdfasdfasdf</li>
						<li>asdfasdfasdf</li>
						<li>asdfasdfasdf</li>
					</ul>

					<a class="elementor-button go-pro" href="<?php echo esc_url( $this->get_cta_url() ); ?>">
						<?php Utils::print_unescaped_internal_string( $this->get_cta_text() ); ?>
					</a>
				</div>
				<iframe width="424" height="238" src="https://www.youtube.com/embed/_Yvf0MNIw-8" title="Elementor Hosting: Why It’s the Best WP Hosting for Elementor Websites!" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
			</div>
		</div>
		<?php
	}
}
