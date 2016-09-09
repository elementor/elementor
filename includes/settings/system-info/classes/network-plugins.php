<?php
namespace Elementor\System_Info\Classes;

use Elementor\System_Info\Classes\Abstracts\Base_Reporter;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Network_Plugins_Reporter extends Base_Reporter {

	private $plugins;

	public function get_title() {
		return 'Network Plugins';
	}

	private function _get_network_plugins() {
		if ( ! $this->plugins ) {
			$active_plugins = get_site_option( 'active_sitewide_plugins' );
			$this->plugins = array_intersect_key( get_plugins(),  $active_plugins );
		}

		return $this->plugins;
	}

	public function is_enabled() {
		if ( ! is_multisite() ) {
			return false;
		};

		return ! ! $this->_get_network_plugins();
	}

	public function get_fields() {
		return [
			'network_active_plugins' => 'Network Plugins',
		];
	}

	public function get_network_active_plugins() {
		return [
			'value' => $this->_get_network_plugins(),
		];
	}
}
