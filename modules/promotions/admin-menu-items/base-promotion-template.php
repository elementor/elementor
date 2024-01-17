<?php

namespace Elementor\Modules\Promotions\AdminMenuItems;

use Elementor\Core\Admin\Menu\Interfaces\Admin_Menu_Item_With_Page;
use Elementor\Settings;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

abstract class Base_Promotion_Template implements Admin_Menu_Item_With_Page {

	abstract protected function get_promotion_title();

	abstract protected function get_cta_url();

	abstract protected function set_list();

	abstract protected function get_video_url();

	public function is_visible() {
		return true;
	}

	public function get_parent_slug() {
		return Settings::PAGE_ID;
	}

	public function get_capability() {
		return 'manage_options';
	}

	protected function get_cta_text() {
		return esc_html__( 'Upgrade Now', 'elementor' );
	}

	/**
	 * Should the promotion have a side note.
	 * @return string
	 */
	protected function get_side_note() {
		return '';
	}

	protected function get_list() {
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
