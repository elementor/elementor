<?php
namespace Elementor\Modules\Home\Transformations;

use Elementor\Modules\Home\Transformations\Base\Transformations_Abstract;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Filter_Plugins extends Transformations_Abstract {

	private array $installed_plugins;

	public function __construct( $args ) {
		parent::__construct( $args );

		$this->installed_plugins = $this->get_installed_plugins();
	}

	public function transform( array $home_screen_data ): array {
		$home_screen_data['add_ons']['repeater'] = $this->get_add_ons_installation_status( $home_screen_data['add_ons']['repeater'] );

		return $home_screen_data;
	}

	private function get_installed_plugins(): array {
		$plugins = $this->wordpress_adapter->get_plugins();

		return array_keys( $plugins );
	}

	private function get_add_ons_installation_status( array $add_ons ): array {
		$transformed_add_ons = [];

		foreach ( $add_ons as $add_on ) {
			$is_plugin = array_key_exists( 'file_path', $add_on );

			if ( ! $is_plugin ) {
				$transformed_add_ons[] = $add_on;
				continue;
			}

			$is_installed_plugin = in_array( $add_on['file_path'], $this->installed_plugins );

			if ( $is_installed_plugin ) {
				$transformed_add_ons[] = $add_on;
			}
		}

		return $transformed_add_ons;
	}
}
