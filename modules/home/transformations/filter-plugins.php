<?php
namespace Elementor\Modules\Home\Transformations;

use Elementor\Modules\Home\Transformations\Base\Transformations_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Filter_Plugins implements Transformations_Base {

	private $home_screen_data;

	public function __construct( $home_screen_data ) {
		$this->home_screen_data = $home_screen_data;
	}

	public function transform(): array {
		$this->set_add_on_installation_status();

		return $this->home_screen_data;
	}

	private function get_installed_plugins(): array {
		$plugins = get_plugins();

		return array_keys( $plugins );
	}

	private function set_add_on_installation_status() {
		$add_ons = $this->home_screen_data['add_ons']['repeater'];
		$index = 0;

		foreach ( $add_ons as $add_on ) {
			$isPlugin = array_key_exists( 'file_path', $add_on );
			$isInstalledPlugin = $isPlugin && in_array( $add_on['file_path'], $this->get_installed_plugins() );

			if ( $isInstalledPlugin ) {
				$this->home_screen_data['add_ons']['repeater'][ $index ]['is_installed'] = true;
			} else if ( $isPlugin ) {
				$this->home_screen_data['add_ons']['repeater'][ $index ]['is_installed'] = false;
			}

			$index++;
		}
	}
}
