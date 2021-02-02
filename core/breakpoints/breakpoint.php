<?php
namespace Elementor\Core\Breakpoints;

use Elementor\Core\Base\Base_Object;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Breakpoint extends Base_Object {

	const BREAKPOINT_OPTION_PREFIX = 'viewport_';

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
	 * @return bool $this->is_enabled
	 */
	public function is_enabled() {
		return $this->is_enabled;
	}

	/**
	 * Get Value
	 *
	 * Retrieve the saved breakpoint value.
	 *
	 * @return array|mixed|string
	 */
	public function get_value() {
		if ( ! $this->value ) {
			$value_from_db = Plugin::$instance->kits_manager->get_current_settings( $this->db_key );

			if ( $value_from_db ) {
				$this->value = $value_from_db;
				$this->is_custom = true;
			} else {
				$this->value = $this->default_value;
			}
		}

		return $this->value;
	}

	public function is_custom() {
		return $this->is_custom;
	}

	public function get_default_value() {
		return $this->default_value;
	}

	public function get_direction() {
		return $this->direction;
	}

	public function __construct( $args ) {
		$this->name = $args['name'];
		$this->db_key = self::BREAKPOINT_OPTION_PREFIX . $args['name'];
		$this->direction = $args['direction'];
		$this->is_enabled = $args['is_enabled'];
		$this->default_value = $args['default_value'];
		$this->value = isset( $args['value'] ) ? $args['value'] : $this->get_value();
	}
}
