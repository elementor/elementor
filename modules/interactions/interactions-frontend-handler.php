<?php

namespace Elementor\Modules\Interactions;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Handles frontend-specific interaction logic including:
 * - Collecting interactions from document elements during render
 * - Outputting interaction data as JSON in the page footer
 *
 * This class is responsible for the frontend rendering pipeline of interactions,
 * working with the Interactions_Collector for data storage and Adapter for data transformation.
 */
class Interactions_Frontend_Handler {

	/**
	 * Collect interactions from document elements during frontend render.
	 *
	 * This method is hooked to 'elementor/frontend/builder_content_data' filter
	 * to capture interactions from all documents (header, footer, post content)
	 * as they are rendered.
	 *
	 * @param array $elements_data The document's elements data.
	 * @param int   $post_id       The document's post ID.
	 * @return array The unmodified elements data (pass-through filter).
	 */
	public function collect_document_interactions( $elements_data, $post_id ) {
		// Only collect on frontend, not in editor
		if ( Plugin::$instance->editor->is_edit_mode() ) {
			return $elements_data;
		}

		if ( empty( $elements_data ) || ! is_array( $elements_data ) ) {
			return $elements_data;
		}

		$collector = Interactions_Collector::instance();

		// Recursively collect interactions from all elements
		$this->collect_interactions_recursive( $elements_data, $collector );

		return $elements_data;
	}

	/**
	 * Recursively iterate through all elements and collect interactions.
	 *
	 * @param array                  $elements  Array of element data.
	 * @param Interactions_Collector $collector The collector instance.
	 */
	private function collect_interactions_recursive( $elements, $collector ) {
		if ( ! is_array( $elements ) ) {
			return;
		}

		foreach ( $elements as $element ) {
			if ( ! is_array( $element ) ) {
				continue;
			}

			// Check if this element has interactions
			if ( ! empty( $element['id'] ) && isset( $element['interactions'] ) ) {
				$element_id = $element['id'];
				$interactions = $element['interactions'];

				// Decode if it's a JSON string
				if ( is_string( $interactions ) ) {
					$decoded = json_decode( $interactions, true );
					if ( json_last_error() === JSON_ERROR_NONE && is_array( $decoded ) ) {
						$interactions = $decoded;
					} else {
						$interactions = null;
					}
				}

				// Normalize the interactions format - ensure we have items array
				if ( is_array( $interactions ) ) {
					// If interactions has 'items' key, it's already in the right format
					// If not, check if it's a direct array of items or has other structure
					if ( ! isset( $interactions['items'] ) ) {
						// Check if this looks like a direct array of interaction items
						// (first element has 'trigger' or 'animation' or '$$type')
						$first_item = reset( $interactions );
						if ( is_array( $first_item ) && ( isset( $first_item['trigger'] ) || isset( $first_item['animation'] ) || isset( $first_item['$$type'] ) ) ) {
							// It's a direct array of items, wrap it
							$interactions = [ 'items' => $interactions ];
						}
					}

					// Register with collector if we have valid items
					$items = $interactions['items'] ?? [];
					if ( ! empty( $items ) || ! empty( $interactions ) ) {
						$collector->register( $element_id, $interactions );
					}
				}
			}

			// Recursively process child elements
			if ( ! empty( $element['elements'] ) && is_array( $element['elements'] ) ) {
				$this->collect_interactions_recursive( $element['elements'], $collector );
			}
		}
	}

	/**
	 * Output collected interaction data as a JSON script tag in the footer.
	 *
	 * This method is hooked to 'wp_footer' to output all collected interactions
	 * as a centralized JSON data block that the frontend JavaScript can consume.
	 */
	public function print_interactions_data() {
		// Only output on frontend, not in editor
		if ( Plugin::$instance->editor->is_edit_mode() ) {
			return;
		}

		$collector = Interactions_Collector::instance();
		$all_interactions = $collector->get_all();

		if ( empty( $all_interactions ) ) {
			return;
		}

		// Format: array of elements, each with elementId, dataId, and cleaned interactions
		$elements_with_interactions = [];
		foreach ( $all_interactions as $element_id => $interactions ) {
			$items = $this->extract_interaction_items( $interactions );

			if ( empty( $items ) ) {
				continue;
			}

			// Clean $$type markers from all interaction items
			$cleaned_items = [];
			foreach ( $items as $item ) {
				if ( ! is_array( $item ) ) {
					continue;
				}
				$cleaned_items[] = Adapter::clean_prop_types( $item );
			}

			if ( empty( $cleaned_items ) ) {
				continue;
			}

			// Build element entry with elementId, dataId, and cleaned interactions array
			$elements_with_interactions[] = [
				'elementId' => $element_id,
				'dataId' => $element_id,
				'interactions' => $cleaned_items,
			];
		}

		if ( empty( $elements_with_interactions ) ) {
			return;
		}

		// Output as JSON script tag
		$json_data = wp_json_encode( $elements_with_interactions, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES );

		// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- JSON data is already encoded
		echo '<script type="application/json" id="elementor-interactions-data">' . $json_data . '</script>';
	}

	/**
	 * Extract interaction items from various data formats.
	 *
	 * Handles multiple formats:
	 * - v1 format: { items: [...] }
	 * - v2 format with $$type: { items: { $$type: '...', value: [...] } }
	 * - Direct arrays: [{ trigger: ..., animation: ... }, ...]
	 *
	 * @param array $interactions The interactions data.
	 * @return array The extracted items array.
	 */
	private function extract_interaction_items( $interactions ) {
		if ( ! is_array( $interactions ) ) {
			return [];
		}

		// Check if it has 'items' key (standard format)
		if ( isset( $interactions['items'] ) ) {
			$items = $interactions['items'];

			// If items is wrapped with $$type (v2 format), extract the value
			if ( isset( $items['$$type'] ) && Adapter::ITEMS_TYPE === $items['$$type'] ) {
				return isset( $items['value'] ) && is_array( $items['value'] ) ? $items['value'] : [];
			}

			return is_array( $items ) ? $items : [];
		}

		// Check if interactions itself is a direct array of items
		// (first element has interaction-related keys)
		$first_item = reset( $interactions );
		if ( is_array( $first_item ) && (
			isset( $first_item['trigger'] ) ||
			isset( $first_item['animation'] ) ||
			isset( $first_item['$$type'] )
		) ) {
			return $interactions;
		}

		return [];
	}
}
