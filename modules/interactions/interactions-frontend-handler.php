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
	 * @var callable|null
	 */
	private $config_provider;

	public function __construct( $config_provider = null ) {
		$this->config_provider = is_callable( $config_provider ) ? $config_provider : null;
	}

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

		$cached_rows = Interactions_Cache::get_valid_rows( $post_id );

		if ( null !== $cached_rows ) {
			foreach ( $cached_rows as $row ) {
				$collector->register( $row['elementId'], [ 'items' => $row['interactions'] ] );
			}
		} else {
			Interactions_Data_Builder::collect_into_collector( $elements_data, $collector );
		}

		return $elements_data;
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
			$items = Interactions_Data_Builder::extract_interaction_items( $interactions );

			if ( empty( $items ) ) {
				continue;
			}

			// Build element entry with elementId, dataId, and cleaned interactions array
			$elements_with_interactions[] = [
				'elementId' => $element_id,
				'dataId' => $element_id,
				'interactions' => $items,
			];
		}

		if ( empty( $elements_with_interactions ) ) {
			return;
		}

		$this->enqueue_interactions_assets();

		// Output as JSON script tag
		$json_data = wp_json_encode( $elements_with_interactions, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES );

		// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- JSON data is already encoded
		echo '<script type="application/json" id="' . Module::SCRIPT_ID_INTERACTIONS_DATA . '">' . $json_data . '</script>';
	}

	private function enqueue_interactions_assets() {
		wp_enqueue_script( Module::HANDLE_MOTION_JS );
		wp_enqueue_script( Module::HANDLE_FRONTEND );

		$config = $this->config_provider ? call_user_func( $this->config_provider ) : [];

		wp_localize_script(
			Module::HANDLE_FRONTEND,
			Module::JS_CONFIG_OBJECT,
			$config
		);
	}
}
