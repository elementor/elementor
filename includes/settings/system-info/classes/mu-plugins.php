<?php
namespace Elementor\System_Info\Classes;

use Elementor\System_Info\Classes\Abstracts\Base_Reporter;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class MU_Plugins_Reporter extends Base_Reporter {

	private $plugins;

	/**
	 * @access private
	 * @since 1.0.0
	 */
	private function _get_must_use_plugins() {
		if ( ! $this->plugins ) {
			$this->plugins = get_mu_plugins();
		}

		return $this->plugins;
	}

	/**
	 * @access public
	 * @since 1.0.0
	 */
	public function is_enabled() {
		return ! ! $this->_get_must_use_plugins();
	}

	/**
	 * @access public
	 * @since 1.0.0
	 */
	public function get_title() {
		return 'Must-Use Plugins';
	}

	/**
	 * @access public
	 * @since 1.0.0
	 */
	public function get_fields() {
		return [
			'must_use_plugins' => 'Must-Use Plugins',
		];
	}

	/**
	 * @access public
	 * @since 1.0.0
	 */
	public function get_must_use_plugins() {
		return [
			'value' => $this->_get_must_use_plugins(),
		];
	}
}
