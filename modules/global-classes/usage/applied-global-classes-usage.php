<?php

namespace Elementor\Modules\Global_Classes\Usage;

use Elementor\Core\Base\Document;
use Elementor\Core\Utils\Collection;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Element_Base;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Widget_Base;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Modules\GlobalClasses\Utils\Atomic_Elements_Utils;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Applied_Global_Classes_Usage {
	/**
	 * Get data about how global classes are applied across Elementor elements.
	 *
	 * @return array<string, int> Statistics about applied global classes per global class
	 */
	public function get() {
		$total_count_per_class_id = array();
		$global_class_ids = Global_Classes_Repository::make()->all()->get_items()->keys()->all();

		if ( empty( $global_class_ids ) ) {
			return array();
		}

		Plugin::$instance->db->iterate_elementor_documents( function ( $document, $elements_data ) use ( &$total_count_per_class_id, $global_class_ids ) {
			$count_per_global_class = $this->get_classes_count_per_class( $elements_data, $global_class_ids );

			$total_count_per_class_id = Collection::make( $count_per_global_class )->reduce( function ( $carry, $count, $class_id ) {
				$carry[ $class_id ] ??= 0;
				$carry[ $class_id ] += $count;

				return $carry;
			}, $total_count_per_class_id );
		});

		foreach ( $global_class_ids as $global_class_id ) {
			$total_count_per_class_id[ $global_class_id ] ??= 0;
		}
		return $total_count_per_class_id;
	}

	private function get_classes_count_per_class( $elements_data, $global_class_ids ) {
		$count_per_class = array();

		Plugin::$instance->db->iterate_data( $elements_data, function ( $element_data ) use ( $global_class_ids, &$count_per_class ) {
			$element_type = Atomic_Elements_Utils::get_element_type( $element_data );
			$element_instance = Atomic_Elements_Utils::get_element_instance( $element_type );

			if ( ! Atomic_Elements_Utils::is_atomic_element( $element_instance ) ) {
				return;
			}

			/** @var Atomic_Element_Base | Atomic_Widget_Base $element_instance */
			$applied_classes_per_element = $this->get_applied_global_classes_per_element( $element_instance->get_props_schema(), $element_data, $global_class_ids );

			foreach ( $applied_classes_per_element as $global_class_id => $count ) {
				$count_per_class[ $global_class_id ] ??= 0;
				$count_per_class[ $global_class_id ] += $count;
			}
		});

		return $count_per_class;
	}

	private function get_applied_global_classes_per_element( $atomic_props_schema, $atomic_element_data, $global_class_ids ) {
		return Collection::make( $atomic_props_schema )->reduce( function ( $carry, $prop_value, $prop_name ) use ( $atomic_element_data, $global_class_ids ) {
			if ( ! Atomic_Elements_Utils::is_classes_prop( $prop_value ) ) {
				return $carry;
			}

			$prop_applied_global_class_ids = $this->get_applied_global_classes( $atomic_element_data['settings'][ $prop_name ]['value'] ?? array(), $global_class_ids );

			foreach ( $prop_applied_global_class_ids as $global_class_id ) {
				$carry[ $global_class_id ] ??= 0;
				$carry[ $global_class_id ] += 1;
			}
			return $carry;
		}, array() );
	}

	private function get_applied_global_classes( $prop, $global_class_ids ) {
		return array_intersect( $prop, $global_class_ids );
	}

	public function get_detailed_usage( bool $with_page_info = false ) {
		$result    = [];
		$pageMap   = [];

		$global_class_ids = Global_Classes_Repository::make()->all()->get_items()->keys()->all();
		if ( empty( $global_class_ids ) ) {
			return [];
		}

		// Initialize each class with an empty array for consistency
		foreach ( $global_class_ids as $class_id ) {
			$result[ $class_id ] = [];
			$pageMap[ $class_id ] = []; // For quick pageId lookup
		}

		Plugin::$instance->db->iterate_elementor_documents( function ( $document, $elements_data ) use ( &$result, &$pageMap, $global_class_ids, $with_page_info ) {
			$page_id    = $document->get_main_id();

			$post_type = get_post_type( $page_id );

			// Skip templates, only process pages or desired post types
			if ( 'elementor_library' === $post_type ) {
				return; // Skip templates
			}


			$page_title = $with_page_info ? get_the_title( $page_id ) : null;

			Plugin::$instance->db->iterate_data( $elements_data, function ( $element_data ) use ( $global_class_ids, $page_id, $page_title, $with_page_info, &$result, &$pageMap ) {
				$element_id = $element_data['id'] ?? null;
				if ( ! $element_id ) {
					return;
				}

				$element_type     = Atomic_Elements_Utils::get_element_type( $element_data );
				$element_instance = Atomic_Elements_Utils::get_element_instance( $element_type );

				if ( ! Atomic_Elements_Utils::is_atomic_element( $element_instance ) ) {
					return;
				}

				$applied_classes = $this->get_applied_global_classes_per_element(
					$element_instance::get_props_schema(),
					$element_data,
					$global_class_ids
				);

				foreach ( array_keys( $applied_classes ) as $class_id ) {
					$page_index = $pageMap[ $class_id ][ $page_id ] ?? null;

					if ( $page_index === null ) {
						$new_entry = [
							'pageId'   => $page_id,
							'elements' => [ $element_id ],
							'total'    => 1,
						];

						if ( $with_page_info ) {
							$new_entry['title'] = $page_title;
						}

						$result[ $class_id ][] = $new_entry;
						$pageMap[ $class_id ][ $page_id ] = count( $result[ $class_id ] ) - 1;
					} else {
						$entry = &$result[ $class_id ][ $page_index ];

						if ( ! isset( $entry['_elMap'] ) ) {
							$entry['_elMap'] = array_flip( $entry['elements'] );
						}

						if ( ! isset( $entry['_elMap'][ $element_id ] ) ) {
							$entry['elements'][] = $element_id;
							$entry['_elMap'][ $element_id ] = true;
							$entry['total']++;
						}
					}
				}
			});
		});

		// Clean up temporary `_elMap` fields
		foreach ( $result as &$class_results ) {
			foreach ( $class_results as &$entry ) {
				unset( $entry['_elMap'] );
			}
		}

		return $result;
	}

}
