<?php
namespace Elementor\Modules\Home\Transformations;

use Elementor\Modules\Home\Transformations\Base\Transformations_Abstract;

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

	private function is_plugin_activated( $plugin_path ) {
		return $this->wordpress_adapter->is_plugin_active( $plugin_path );
	}

	private function get_install_plugin_url( $plugin_path ) {
		$slug = dirname( $plugin_path );
		$nonce_url = $this->wordpress_adapter->wp_nonce_url( self_admin_url( 'update.php?action=install-plugin&plugin=' . $slug ), 'install-plugin_' . $slug );
		return $this->removeAndAmpFromUrl( $nonce_url );
	}

	private function get_activate_plugin_url( $plugin_path ) {
		$nonce_url = $this->wordpress_adapter->wp_nonce_url( 'plugins.php?action=activate&amp;plugin=' . $plugin_path . '&amp;plugin_status=all&amp;paged=1&amp;s', 'activate-plugin_' . $plugin_path );
		return $this->removeAndAmpFromUrl( $nonce_url );
	}

	private function removeAndAmpFromUrl( $url ) {
		return str_replace( '&amp;', '&', $url );
	}

	private function get_add_ons_installation_status( array $add_ons ): array {
		$transformed_add_ons = [];

		foreach ( $add_ons as $add_on ) {
			$is_plugin = 'link' !== $add_on['type'];

			if ( ! $is_plugin ) {
				$transformed_add_ons[] = $add_on;
				continue;
			}

			$plugin_path = $add_on['file_path'];
			$is_installed_plugin = in_array( $plugin_path, $this->installed_plugins );

			if ( ! $is_installed_plugin ) {
				$plugin_url = 'wporg' === $add_on['type']
					? $this->get_install_plugin_url( $plugin_path )
					: $add_on['url'];

				$add_on['url'] = $plugin_url;

				$transformed_add_ons[] = $add_on;
				continue;
			}

			$is_active_plugin = $this->is_plugin_activated( $plugin_path );

			if ( $is_active_plugin ) {
				continue;
			}

			$add_on['url'] = $this->get_activate_plugin_url( $plugin_path );
			$add_on['button_label'] = esc_html__( 'Activate', 'elementor' );

			$transformed_add_ons[] = $add_on;
		}

		return $transformed_add_ons;
	}
}
