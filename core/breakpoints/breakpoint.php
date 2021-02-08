<?php
namespace Elementor\Core\Breakpoints;

use Elementor\Core\Base\Base_Object;
use Elementor\Plugin;
use Elementor\Core\Breakpoints\Manager as Breakpoints_Manager;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Breakpoint extends Base_Object {

	private $name;
	private $default_value;
	private $db_key;
	private $value;
	private $is_custom;
	private $direction = 'max';
	private $is_enabled = false;

	/**
	 * Get Name
	 *
	 * @since 3.2.0
	 *
	 * @return string
	 */
	public function get_name() {
		return $this->name;
	}

	/**
	 * Get Initial Config
	 *
	 * @since 3.2.0
	 *
	 * @return array Initial Config
	 */
	public function get_config() {
		return [
			'value' => $this->get_value(),
			'direction' => $this->direction,
			'is_enabled' => $this->is_enabled(),
		];
	}

	/**
	 * Is Enabled
	 *
	 * Check if the breakpoint is enabled or not. The breakpoint instance receives this data from
	 * the Breakpoints Manager.
	 *
	 * @return bool $is_enabled class variable
	 */
	public function is_enabled() {
		return $this->is_enabled;
	}

	/**
	 * Get Value
	 *
	 * Retrieve the saved breakpoint value.
	 *
	 * @since 3.2.0
	 *
	 * @return int $value class variable
	 */
	public function get_value() {
		if ( ! $this->value ) {
			$this->set_value();
		}

		return $this->value;
	}

	/**
	 * Set Value
	 *
	 * Set the `$value` class variable and the `$is_custom` class variable.
	 *
	 * @since 3.2.0
	 *
	 * @return int $value class variable
	 */
	private function set_value() {
		$kits_manager = Plugin::$instance->kits_manager;
		$value_from_db = $kits_manager->get_current_settings( $this->db_key );

		if ( $value_from_db ) {
			$this->value = $value_from_db;
			$this->is_custom = true;
		} else {
			$this->value = $this->default_value;
			$this->is_custom = false;
		}

		return $this->value;
	}

	/**
	 * Is Custom
	 *
	 * Check if the breakpoint's value is a custom or default value.
	 *
	 * @since 3.2.0
	 *
	 * @return bool $is_custom class variable
	 */
	public function is_custom() {
		return $this->is_custom;
	}

	/**
	 * Get Default Value
	 *
	 * Returns the Breakpoint's default value.
	 *
	 * @since 3.2.0
	 *
	 * @return int $default_value class variable
	 */
	public function get_default_value() {
		return $this->default_value;
	}

	/**
	 * Get Direction
	 *
	 * Returns the Breakpoint's direction ('min'/'max').
	 *
	 * @since 3.2.0
	 *
	 * @return string $direction class variable
	 */
	public function get_direction() {
		return $this->direction;
	}

	public function __construct( $args ) {
		$this->name = $args['name'];
		$this->db_key = Breakpoints_Manager::BREAKPOINT_OPTION_PREFIX . $args['name'];
		$this->direction = $args['direction'];
		$this->is_enabled = $args['is_enabled'];
		$this->default_value = $args['default_value'];
		$this->value = $this->set_value();
	}
}
