<?php
namespace Elementor\Core\Isolation;

interface Wordpress_Adapter_Interface {

	public function get_plugins();

	public function is_plugin_active( $plugin_path );

	public function wp_nonce_url( $url, $action );

	public function self_admin_url( $path );
}
