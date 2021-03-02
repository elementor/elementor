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
	private $label;
	private $default_value;
	private $db_key;
	private $value;
	private $is_custom;
	private $direction = 'max';
	private $is_enabled = false;
	private $config;

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
	 * @param null|string $item
	 * @return array Initial config
	 */
	public function get_config( $item = null ) {
		if ( ! $this->config ) {
			$this->config = [
				'label' => $this->label,
				'value' => $this->get_value(),
				'direction' => $this->direction,
				'is_enabled' => $this->is_enabled(),
			];
		}

		return self::get_items( $this->config, $item );
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
			$this->init_value();
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
		if ( ! $this->is_custom ) {
			$this->get_value();
		}

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

	/**
	 * Set Value
	 *
	 * Set the `$value` class variable and the `$is_custom` class variable.
	 *
	 * @since 3.2.0
	 *
	 * @return int $value class variable
	 */
	private function init_value() {
		$cached_value = Plugin::$instance->kits_manager->get_current_settings( $this->db_key );

		if ( $cached_value ) {
			$this->value = (int) $cached_value;

			$this->is_custom = $this->value !== $this->default_value;
		} else {
			$this->value = $this->default_value;

			$this->is_custom = false;
		}

		return $this->value;
	}

	public function __construct( $args ) {
		$this->name = $args['name'];
		$this->label = $args['label'];
		// Used for CSS generation
		$this->db_key = Breakpoints_Manager::BREAKPOINT_OPTION_PREFIX . $args['name'];
		$this->direction = $args['direction'];
		$this->is_enabled = $args['is_enabled'];
		$this->default_value = $args['default_value'];
	}
}
