<?php
namespace Elementor\Testing\Traits;

use Elementor\Plugin;
use Elementor\Core\Kits\Manager;

/**
 * @mixin \WP_UnitTestCase
 */
trait Kit_Trait {
	protected function create_default_kit() {
		return Manager::create_default_kit();
	}

	protected function remove_default_kit() {
		// Make sure the the 'wp_delete_post' function will actually delete the kit.
		$_GET['force_delete_kit'] = '1';

		$active_kit_id = Plugin::$instance->kits_manager->get_active_id();

		wp_delete_post( $active_kit_id, true );
		delete_option( Manager::OPTION_ACTIVE );

		unset( $_GET['force_delete_kit'] );
	}
}
