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

	private function is_plugin( $add_on ) {
		return 'link' !== $add_on['type'];
	}

	private function is_plugin_installed( $plugin_path ) {
		return in_array( $plugin_path, $this->installed_plugins );
	}

	private function is_plugin_activated( $plugin_path ) {
		return $this->wordpress_adapter->is_plugin_active( $plugin_path );
	}

	private function get_install_plugin_url( $plugin_path ) {
		$slug = dirname( $plugin_path );
		$admin_url = $this->wordpress_adapter->self_admin_url( 'update.php?action=install-plugin&plugin=' . $slug );
		$nonce_url = $this->wordpress_adapter->wp_nonce_url( $admin_url, 'install-plugin_' . $slug );
		return $this->removeAmpersandFromUrl( $nonce_url );
	}

	private function get_activate_plugin_url( $plugin_path ) {
		$nonce_url = $this->wordpress_adapter->wp_nonce_url( 'plugins.php?action=activate&amp;plugin=' . $plugin_path . '&amp;plugin_status=all&amp;paged=1&amp;s', 'activate-plugin_' . $plugin_path );
		return $this->removeAmpersandFromUrl( $nonce_url );
	}

	private function removeAmpersandFromUrl( $url ) {
		return str_replace( '&amp;', '&', $url );
	}

	private function get_add_ons_installation_status( array $add_ons ): array {
		$transformed_add_ons = [];

		foreach ( $add_ons as $add_on ) {

			if ( $this->is_plugin( $add_on ) ) {
				$transformed_add_ons[] = $this->handle_plugin_add_on( $add_on );
			} else {
				$transformed_add_ons[] = $add_on;
			}
		}

		return $transformed_add_ons;
	}

	private function get_plugin_installation_status( $add_on ): string {
		$plugin_path = $add_on['file_path'];

		if ( ! $this->is_plugin_installed( $plugin_path ) ) {

			if ( 'wporg' === $add_on['type'] ) {
				return 'not-installed-wporg';
			}

			return 'not-installed-not-wporg';
		}

		if ( $this->is_plugin_activated( $plugin_path ) ) {
			return 'activated';
		}

		return 'installed-not-activated';
	}

	private function handle_plugin_add_on( $add_on ): array {
		$installation_status = $this->get_plugin_installation_status( $add_on );

		if ( 'activated' === $installation_status ) {
			return $add_on;
		}

		switch ( $this->get_plugin_installation_status( $add_on ) ) {
			case 'not-installed-not-wporg':
				break;
			case 'not-installed-wporg':
				$add_on['url'] = $this->get_install_plugin_url( $add_on['file_path'] );
				$add_on['target'] = '_self';
				break;
			case 'installed-not-activated':
				$add_on['url'] = $this->get_activate_plugin_url( $add_on['file_path'] );
				$add_on['button_label'] = esc_html__( 'Activate', 'elementor' );
				$add_on['target'] = '_self';
				break;
		}

		return $add_on;
	}
}
