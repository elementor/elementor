<?php

namespace Elementor\Modules\Global_Classes\Usage;

use Elementor\Core\Utils\Collection;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Element_Base;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Widget_Base;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Modules\GlobalClasses\Utils\Atomic_Elements_Utils;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Applied_Global_Classes_Usage {

	private array $title_cache = array();

	public function get(): array {
		$total = array();
		$class_ids = $this->get_all_class_ids();

		if ( array() === $class_ids ) {
			return array();
		}

		Plugin::$instance->db->iterate_elementor_documents(
			function ( $document, $elements_data ) use ( &$total, $class_ids ) {
				$counts = $this->count_classes_in_document( $elements_data, $class_ids );
				$this->merge_class_counts( $counts, $total );
			}
		);

		$this->ensure_all_class_ids_present( $class_ids, $total );

		return $total;
	}

	public function get_detailed_usage( bool $with_page_info = false ): array {
		$result = array();
		$page_map = array();
		$class_ids = $this->get_all_class_ids();

		if ( array() === $class_ids ) {
			return array();
		}

		$this->initialize_tracking_maps( $class_ids, $result, $page_map );

		Plugin::$instance->db->iterate_elementor_documents(
			function ( $document, $elements_data ) use ( &$result, &$page_map, $class_ids, $with_page_info ) {
				$this->process_document_for_usage( $document, $elements_data, $class_ids, $with_page_info, $result, $page_map );
			}
		);

		$this->flatten_element_keys( $result );

		return $result;
	}

	/**
	 * @return string[]
	 */
	private function get_all_class_ids(): array {
		return Global_Classes_Repository::make()->all()->get_items()->keys()->all();
	}

	private function count_classes_in_document( $elements_data, array $class_ids ): array {
		$counts = array();
		Plugin::$instance->db->iterate_data(
			$elements_data,
			function ( $element_data ) use ( $class_ids, &$counts ) {
				if ( $this->is_valid_atomic_element( $element_data ) ) {
					$instance = Atomic_Elements_Utils::get_element_instance( Atomic_Elements_Utils::get_element_type( $element_data ) );
					$classes = $this->get_applied_global_classes_per_element( $instance->get_props_schema(), $element_data, $class_ids );
					$this->merge_class_counts( $classes, $counts );
				}
			}
		);
		return $counts;
	}

	private function merge_class_counts( array $from, array &$into ): void {
		foreach ( $from as $id => $count ) {
			$into[ $id ] ??= 0;
			$into[ $id ] += $count;
		}
	}

	private function ensure_all_class_ids_present( array $ids, array &$target ): void {
		foreach ( $ids as $id ) {
			$target[ $id ] ??= 0;
		}
	}

	private function initialize_tracking_maps( array $class_ids, array &$result, array &$page_map ): void {
		foreach ( $class_ids as $id ) {
			$result[ $id ] = array();
			$page_map[ $id ] = array();
		}
	}

	private function process_document_for_usage( $document, $elements_data, array $class_ids, bool $with_page_info, array &$result, array &$page_map ): void {
		$page_id = $document->get_main_id();
		if ( 'elementor_library' === get_post_type( $page_id ) ) {
			return;
		}

		$page_title = $with_page_info ? $this->get_page_title( $page_id ) : null;

		Plugin::$instance->db->iterate_data(
			$elements_data,
			function ( $element_data ) use ( $class_ids, $page_id, $page_title, $with_page_info, &$result, &$page_map ) {
				$this->track_element_usage( $element_data, $class_ids, $page_id, $page_title, $with_page_info, $result, $page_map );
			}
		);
	}

	private function track_element_usage( array $element_data, array $class_ids, int $page_id, ?string $page_title, bool $with_page_info, array &$result, array &$page_map ): void {
		$element_id = $element_data['id'] ?? null;
		if ( null === $element_id || ! $this->is_valid_atomic_element( $element_data ) ) {
			return;
		}

		$instance = Atomic_Elements_Utils::get_element_instance( Atomic_Elements_Utils::get_element_type( $element_data ) );
		$applied = $this->get_applied_global_classes_per_element( $instance::get_props_schema(), $element_data, $class_ids );

		foreach ( $applied as $class_id => $_ ) {
			$page_index = $page_map[ $class_id ][ $page_id ] ?? null;

			if ( null === $page_index ) {
				$page_map[ $class_id ][ $page_id ] = count( $result[ $class_id ] );
				$entry = array(
					'pageId'   => $page_id,
					'elements' => array( $element_id => true ),
					'total'    => 1,
				);

				if ( $with_page_info ) {
					$entry['title'] = $page_title;
				}

				$result[ $class_id ][] = $entry;
			} else {
				$entry = &$result[ $class_id ][ $page_index ];
				if ( ! isset( $entry['elements'][ $element_id ] ) ) {
					$entry['elements'][ $element_id ] = true;
					++$entry['total'];
				}
			}
		}
	}

	private function get_applied_global_classes_per_element( $schema, $element_data, array $class_ids ): array {
		return Collection::make( $schema )->reduce(
			function ( $carry, $prop, $name ) use ( $element_data, $class_ids ) {
				if ( ! Atomic_Elements_Utils::is_classes_prop( $prop ) ) {
					return $carry;
				}
				$values = $element_data['settings'][ $name ]['value'] ?? array();
				$ids = array_intersect( $values, $class_ids );
				foreach ( $ids as $id ) {
					$carry[ $id ] ??= 0;
					$carry[ $id ]++;
				}
				return $carry;
			},
			array()
		);
	}

	private function get_page_title( int $page_id ): string {
		return $this->title_cache[ $page_id ] ??= get_the_title( $page_id );
	}

	private function flatten_element_keys( array &$result ): void {
		foreach ( $result as &$entries ) {
			foreach ( $entries as &$entry ) {
				$entry['elements'] = array_keys( $entry['elements'] );
			}
		}
	}

	private function is_valid_atomic_element( array $element_data ): bool {
		$type = Atomic_Elements_Utils::get_element_type( $element_data );
		$instance = Atomic_Elements_Utils::get_element_instance( $type );
		return Atomic_Elements_Utils::is_atomic_element( $instance );
	}
}
