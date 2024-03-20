<?php
namespace Elementor\Modules\Home\Transformations;

use Elementor\Modules\Home\Transformations\Base\Transformations_Abstract;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Filter_Plugins extends Transformations_Abstract {

	public function transform(): array {
		$this->set_add_on_installation_status();

		return $this->home_screen_data;
	}

	private function get_installed_plugins(): array {
		$plugins = $this->wordpress_adapter->get_plugins();

		return array_keys( $plugins );
	}

	private function set_add_on_installation_status() {
		$add_ons = $this->home_screen_data['add_ons']['repeater'];
		$index = 0;

		foreach ( $add_ons as $add_on ) {
			$is_plugin = array_key_exists( 'file_path', $add_on );
			$is_installed_plugin = $is_plugin && in_array( $add_on['file_path'], $this->get_installed_plugins() );

			if ( $is_plugin ) {
				$this->home_screen_data['add_ons']['repeater'][ $index ]['is_installed'] = $is_installed_plugin;
			}

			$index++;
		}
	}
}
