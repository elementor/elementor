<?php

namespace Elementor\Modules\GlobalClasses\Usage;

use Elementor\Core\Base\Document as ElementorDocument;
use Elementor\Plugin;

/**
 * Tracks usage of global CSS classes within a specific Elementor document.
 */
class Document_Usage {


	/** @var ElementorDocument */
	private ElementorDocument $document;

	/**
	 * Map of known global class ID => true for O(1) membership checks.
	 *
	 * @var array<string, true>
	 */
	private array $valid_class_id_set;

	/** @var array<string, Css_Class_Usage> */
	private array $usages = [];

	/**
	 * Constructor.
	 *
	 * @param ElementorDocument   $document          The Elementor document object.
	 * @param array<string, true> $valid_class_id_set Known global class IDs (e.g. from array_fill_keys).
	 */
	public function __construct( ElementorDocument $document, array $valid_class_id_set ) {
		$this->document = $document;
		$this->valid_class_id_set = $valid_class_id_set;
	}

	/**
	 * Analyze the document to find and record usage of global CSS classes.
	 */
	public function analyze(): void {
		$page_id       = $this->document->get_main_id();
		$page_title    = $this->document->get_post()->post_title;
		$elements_data = $this->document->get_elements_raw_data() ?? [];

		$document_type = $this->document->get_type();
		if ( empty( $document_type ) ) {
			$document_type = get_post_type( $page_id ) ?? 'unknown';
		}

		if ( empty( $elements_data ) ) {
			return;
		}

		Plugin::$instance->db->iterate_data(
			$elements_data,
			function ( $element_data ) use ( $page_id, $page_title, $document_type ) {
				$class_values = $element_data['settings']['classes']['value'] ?? [];

				if ( empty( $class_values ) || ! is_array( $class_values ) ) {
					return;
				}

				foreach ( $class_values as $class_id ) {
					if ( ! isset( $this->valid_class_id_set[ $class_id ] ) ) {
						continue;
					}

					if ( ! isset( $this->usages[ $class_id ] ) ) {
						$this->usages[ $class_id ] = new Css_Class_Usage( $class_id );
					}

					$this->usages[ $class_id ]->track_usage(
						$page_id,
						$page_title,
						$element_data['id'] ?? 'unknown',
						$document_type
					);
				}
			}
		);
	}

	/**
	 * Get all recorded usages of global CSS classes in this document.
	 *
	 * @return array<string, Css_Class_Usage>
	 */
	public function get_usages(): array {
		return $this->usages;
	}
}
