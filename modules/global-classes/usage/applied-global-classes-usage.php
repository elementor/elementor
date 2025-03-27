<?php

namespace Elementor\Modules\Global_Classes\Usage;

use Elementor\Core\Base\Document;
use Elementor\Core\Utils\Collection;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Element_Base;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Widget_Base;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Applied_Global_Classes_Usage {
	/**
	 * Get data about how global classes are applied across Elementor elements.
	 *
	 * @return array<string, int> Statistics about applied global classes per element type
	 */
	public function get() {
		return $this->get_posts_data( $this->get_elementor_posts() );
	}

	private function get_posts_data( $elementor_posts ) {
		$global_class_ids = Global_Classes_Repository::make()->all()->get_items()->keys()->all();
		$count_per_type = [];

		foreach ( $elementor_posts as $post ) {
			$document = Plugin::$instance->documents->get( $post->ID );
			$elements_data = $document->get_json_meta( Document::ELEMENTOR_DATA_META_KEY );

			$post_count_per_type = $this->get_elements_data( $elements_data, $global_class_ids );

			$count_per_type = Collection::make( $post_count_per_type )->reduce( function( $carry, $count, $element_type ) {
				$carry[ $element_type ] ??= 0;
				$carry[ $element_type ] += $count;

				return $carry;
			}, $count_per_type );
		}

		return $count_per_type;
	}

	private function get_elements_data( $elements_data, $global_class_ids ) {
		$count_per_type = [];

		Plugin::$instance->db->iterate_data( $elements_data, function( $element_data ) use ( $global_class_ids, &$total_count, &$count_per_type ) {
			$element_type = $this->get_element_type( $element_data );

			$element_instance = $this->get_element_instance( $element_type );

			/** @var Atomic_Element_Base | Atomic_Widget_Base $element_instance */
			if ( ! $this->is_atomic_element( $element_instance ) ) {
				return;
			}

			$classes_count = $this->get_classes_count_for_element( $element_instance->get_props_schema(), $element_data, $global_class_ids );

			if ( 0 !== $classes_count ) {
				$count_per_type[ $element_type ] ??= 0;
				$count_per_type[ $element_type ] += $classes_count;
			}
		});

		return $count_per_type;
	}

	private function get_classes_count_for_element( $atomic_props_schema, $atomic_element_data, $global_class_ids ) {
		return Collection::make( $atomic_props_schema )->reduce( function( $carry, $prop, $prop_name ) use ( $atomic_element_data, $global_class_ids ) {
			if ( ! $this->is_classes_prop( $prop ) ) {
				return $carry;
			}

			$carry += $this->get_global_classes_count( $atomic_element_data, $global_class_ids, $prop_name );

			return $carry;
		}, 0 );
	}

	private function get_element_type( $element ) {
		return 'widget' === $element['elType'] ? $element['widgetType'] : $element['elType'];
	}

	private function get_element_instance( $element_type ) {
		$widget = Plugin::$instance->widgets_manager->get_widget_types( $element_type );
		$element = Plugin::$instance->elements_manager->get_element_types( $element_type );

		return $widget ?? $element;
	}

	private function is_atomic_element( $element_instance ) {
		if ( ! $element_instance ) {
			return false;
		}

		return $element_instance instanceof Atomic_Element_Base ||
			$element_instance instanceof Atomic_Widget_Base;
	}

	private function is_classes_prop( $prop ) {
		return 'plain' === $prop::KIND && 'classes' === $prop->get_key();
	}

	private function get_global_classes_count( $element_data, $global_class_ids, $classes_prop ) {
		if ( ! isset( $element_data['settings'][ $classes_prop ] ) ) {
			return 0;
		}

		return count( array_intersect( $element_data['settings'][ $classes_prop ]['value'], $global_class_ids ) );
	}

	private function get_elementor_posts() {
		$args = wp_parse_args( [
			'post_type' => 'any',
			'post_status' => [ 'publish' ],
			'posts_per_page' => '-1',
			'meta_key' => Document::BUILT_WITH_ELEMENTOR_META_KEY,
			'meta_value' => 'builder',
		] );

		$query = new \WP_Query( $args );

		return $query->get_posts();
	}
}
