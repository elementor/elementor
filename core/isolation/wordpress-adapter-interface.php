<?php
namespace Elementor\Core\Isolation;

interface Wordpress_Adapter_Interface {

	public function get_plugins();

	public function is_plugin_active( $plugin_path );

	public function wp_nonce_url( $url, $action );

	public function self_admin_url( $path );

	public function get_pages( $args );

	public function get_option( $option_key );

	public function add_option( $option_key, $option_value );

	public function update_option( $option_key, $option_value );
}
