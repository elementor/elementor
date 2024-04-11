<?php
namespace Elementor\Core\Isolation;

interface Elementor_Adapter_Interface {

	public function is_plugin_installed( $plugin_path ): bool;

	public function is_plugin_activated( $plugin_path ): bool;

	public function get_install_plugin_url( $plugin_path ): string;

	public function get_activate_plugin_url( $plugin_path ): string;
}
