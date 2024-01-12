<?php

namespace Elementor\Modules\Promotions\AdminMenuItems;

use Elementor\Modules\Promotions\AdminMenuItems\Interfaces\Menu_Item_Promotion;
use Elementor\Settings;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

abstract class Base_Promotion_Template implements Menu_Item_Promotion {

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

	public function get_side_note() {
		return '';
	}

	public function set_list() {
		return [];
	}

	public function get_list() {
		ob_start();
		if ( ! empty( $this->set_list() ) ) {
			?>
			<ul>
				<?php foreach ( $this->set_list() as $item ) { ?>
					<li><?php Utils::print_unescaped_internal_string( $item ); ?></li>
				<?php } ?>
			</ul>
			<?php
		}

		return ob_get_clean();
	}

	public function get_video_url() {
		return '';
	}

	public function render() {
		?>
			<div class="e-feature-promotion">
				<div class="e-feature-promotion_data">
					<h3><?php Utils::print_unescaped_internal_string( $this->get_promotion_title() ); ?></h3>

					<?php Utils::print_unescaped_internal_string( $this->get_list() ); ?>

					<a class="elementor-button go-pro" href="<?php echo esc_url( $this->get_cta_url() ); ?>" target="_blank">
						<?php Utils::print_unescaped_internal_string( $this->get_cta_text() ); ?>
					</a>

					<?php if ( ! empty( $this->get_side_note() ) ) { ?>
						<div class="side-note">
							<p><?php Utils::print_unescaped_internal_string( $this->get_side_note() ); ?></p>
						</div>
					<?php } ?>

				</div>

				<iframe class="e-feature-promotion_iframe" src="<?php Utils::print_unescaped_internal_string( $this->get_video_url() ); ?>" title="Elementor" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
			</div>
		<?php
	}
}
