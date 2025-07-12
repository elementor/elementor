<?php

namespace Elementor\Modules\GlobalClasses\Usage;

use Elementor\Plugin;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use const pcov\all;

class Document_Usage {

	private \Elementor\Core\Base\Document $document;
	private array $elements_data;
	private array $usages = array();

	public function __construct( \Elementor\Core\Base\Document $document ) {
		$this->document = $document;
		$this->elements_data = $document->get_elements_raw_data() ?? array();
	}



	public function analyze(): void {
		$page_id = $this->document->get_main_id();

		if ( 'elementor_library' === get_post_type( $page_id ) ) {
			return;
		}

		$class_ids  = $this->get_all_global_class_ids();
		$page_title = get_the_title( $page_id );

		if ( empty( $this->elements_data ) ) {
			return;
		}

		Plugin::$instance->db->iterate_data(
			$this->elements_data,
			function ( $element_data ) use ( $class_ids, $page_id, $page_title ) {
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
						$element_data['id'] ?? 'unknown'
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
