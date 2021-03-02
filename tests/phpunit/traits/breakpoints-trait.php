<?php
namespace Elementor\Testing\Traits;

use Elementor\Plugin;

Trait Breakpoints_Trait {

	function set_admin_user() {
		wp_set_current_user( $this->factory()->get_administrator_user()->ID );

		$kit = Plugin::$instance->kits_manager->get_active_kit();

		// In the production environment 'JS' sends empty array, do the same.
		add_post_meta( $kit->get_main_id(), '_elementor_data', '[]' );
	}
}
