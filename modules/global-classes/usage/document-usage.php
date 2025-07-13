<?php

namespace Elementor\Modules\GlobalClasses\Usage;

use Elementor\Plugin;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Modules\GlobalClasses\Usage\Css_Class_Usage;
use Elementor\Core\Base\Document;

class Document_Usage {

	private Document $document;
	private array $elements_data;
	private array $usages = [];
	private string $document_type;

	public function __construct( Document $document ) {
		$this->document       = $document;
		$this->elements_data  = $document->get_elements_raw_data() ?? [];
		$this->document_type  = $this->detect_document_type( $document );
	}

	private function detect_document_type( Document $document ): string {
		$elementor_type = $document->get_type();

		if ( $elementor_type ) {
			return $elementor_type;
		}

		return get_post_type( $document->get_main_id() ) ?? 'unknown';
	}

	public function get_document_type(): string {
		return $this->document_type;
	}

	public function analyze(): void {
		$page_id = $this->document->get_main_id();

		if ( 'elementor_library' === get_post_type( $page_id ) ) {
			return;
		}

		$class_ids     = $this->get_all_global_class_ids();
		$page_title    = get_the_title( $page_id );
		$document_type = $this->get_document_type();

		if ( empty( $this->elements_data ) ) {
			return;
		}

		Plugin::$instance->db->iterate_data(
			$this->elements_data,
			function ( $element_data ) use ( $class_ids, $page_id, $page_title, $document_type ) {
				$class_values = $element_data['settings']['classes']['value'] ?? [];

				if ( empty( $class_values ) || ! is_array( $class_values ) ) {
					return;
				}

				foreach ( $class_values as $class_id ) {
					if ( ! in_array( $class_id, $class_ids, true ) ) {
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

	public function get_usages(): array {
		return $this->usages;
	}

	private function get_all_global_class_ids(): array {
		return Global_Classes_Repository::make()->all()->get_items()->keys()->all();
	}
}
