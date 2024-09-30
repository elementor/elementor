<?php
namespace Elementor\Core\Isolation;

use Elementor\Plugin;

class Kit_Adapter implements Kit_Adapter_Interface {

	public function get_kit_settings() {
		return Plugin::$instance->kits_manager->get_kit_for_frontend()->get_settings();
	}

	public function get_main_post() {
		return Plugin::$instance->kits_manager->get_kit_for_frontend()->get_main_post();
	}
}
