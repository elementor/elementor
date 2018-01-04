<?php
namespace Elementor\System_Info\Classes;

use Elementor\System_Info\Classes\Abstracts\Base_Reporter;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Plugins_Reporter extends Base_Reporter {

	private $plugins;

	/**
	 * @access private
	 * @since 1.0.0
	 */
	private function _get_plugins() {
		if ( ! $this->plugins ) {
			// Ensure get_plugins function is loaded
			if ( ! function_exists( 'get_plugins' ) ) {
				include ABSPATH . '/wp-admin/includes/plugin.php';
			}

			$active_plugins = get_option( 'active_plugins' );
			$this->plugins  = array_intersect_key( get_plugins(), array_flip( $active_plugins ) );
		}

		return $this->plugins;
	}

	/**
	 * @access public
	 * @since 1.0.0
	 */
	public function get_title() {
		return 'Active Plugins';
	}

	/**
	 * @access public
	 * @since 1.0.0
	 */
	public function is_enabled() {
		return ! ! $this->_get_plugins();
	}

	/**
	 * @access public
	 * @since 1.0.0
	 */
	public function get_fields() {
		return [
			'active_plugins' => 'Active Plugins',
		];
	}

	/**
	 * @access public
	 * @since 1.0.0
	 */
	public function get_active_plugins() {
		return [
			'value' => $this->_get_plugins(),
		];
	}
}
