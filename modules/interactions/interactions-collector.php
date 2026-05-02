<?php

namespace Elementor\Modules\Interactions;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Collects interaction data from all rendered documents and provides centralized access.
 */
class Interactions_Collector {
	/**
	 * @var Interactions_Collector
	 */
	private static $instance = null;

	/**
	 * @var array Stores interaction data keyed by element ID
	 * Format: [ 'element_id' => [ interaction_items... ] ]
	 */
	private $interactions_data = [];

	/**
	 * Get singleton instance.
	 *
	 * @return Interactions_Collector
	 */
	public static function instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	/**
	 * Register interaction data for an element.
	 *
	 * @param string $element_id The element ID (data-id attribute value)
	 * @param array  $interactions The full interactions array from the element
	 */
	public function register( $element_id, $interactions ) {
		if ( empty( $element_id ) || empty( $interactions ) ) {
			return;
		}

		$this->interactions_data[ $element_id ] = $interactions;
	}

	/**
	 * Get all collected interaction data.
	 *
	 * @return array Format: [ 'element_id' => interactions_array ]
	 */
	public function get_all() {
		return $this->interactions_data;
	}

	/**
	 * Get interaction data for a specific element.
	 *
	 * @param string $element_id The element ID
	 * @return array|null
	 */
	public function get( $element_id ) {
		return $this->interactions_data[ $element_id ] ?? null;
	}

	/**
	 * Reset collected data (useful for testing or page reloads).
	 */
	public function reset() {
		$this->interactions_data = [];
	}
}
