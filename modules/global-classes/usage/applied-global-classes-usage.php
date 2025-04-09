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
		$total_count_per_class_id = [];
		$global_class_ids = Global_Classes_Repository::make()->all()->get_items()->keys()->all();

		if ( empty( $global_class_ids ) ) {
			return [];
		}

		Plugin::$instance->db->iterate_elementor_documents( function( $document, $elements_data ) use ( &$total_count_per_class_id, $global_class_ids ) {
			$count_per_global_class = $this->get_classes_count_per_class( $elements_data, $global_class_ids );

			$total_count_per_class_id = Collection::make( $count_per_global_class )->reduce( function( $carry, $count, $class_id ) {
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
		$count_per_class = [];

		Plugin::$instance->db->iterate_data( $elements_data, function( $element_data ) use ( $global_class_ids, &$count_per_class ) {
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
		return Collection::make( $atomic_props_schema )->reduce( function( $carry, $prop_value, $prop_name ) use ( $atomic_element_data, $global_class_ids ) {
			if ( ! Atomic_Elements_Utils::is_classes_prop( $prop_value ) ) {
				return $carry;
			}

			$prop_applied_global_class_ids = $this->get_applied_global_classes( $atomic_element_data['settings'][ $prop_name ]['value'] ?? [], $global_class_ids );

			foreach ( $prop_applied_global_class_ids as $global_class_id ) {
				$carry[ $global_class_id ] ??= 0;
				$carry[ $global_class_id ] += 1;
			}

			return $carry;
		}, [] );
	}

	private function get_applied_global_classes( $prop, $global_class_ids ) {
		return array_intersect( $prop, $global_class_ids );
	}
}
