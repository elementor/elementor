<?php
namespace Elementor\Core\Isolation;

class Elementor_Adapter implements Elementor_Adapter_Interface {

	public Wordpress_Adapter $wordpress_adapter;

	public function __construct() {
		$this->wordpress_adapter = new Wordpress_Adapter();
	}

	public function is_plugin_installed( $plugin_path ): bool {
		$installed_plugins = $this->wordpress_adapter->get_plugins();

		return isset( $installed_plugins[ $plugin_path ] );
	}

	public function is_plugin_activated( $plugin_path ): bool {
		return $this->wordpress_adapter->is_plugin_active( $plugin_path );
	}

	public function get_install_plugin_url( $plugin_path ): string {
		$slug = dirname( $plugin_path );
		$admin_url = $this->wordpress_adapter->self_admin_url( 'update.php?action=install-plugin&plugin=' . $slug );
		return $this->wordpress_adapter->wp_nonce_url( $admin_url, 'install-plugin_' . $slug );
	}

	public function get_activate_plugin_url( $plugin_path ): string {
		return $this->wordpress_adapter->wp_nonce_url( 'plugins.php?action=activate&amp;plugin=' . $plugin_path . '&amp;plugin_status=all&amp;paged=1&amp;s', 'activate-plugin_' . $plugin_path );
	}
}
