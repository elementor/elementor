<?php

namespace Elementor\Modules\Global_Classes\Usage;

use Elementor\Core\Utils\Collection;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Element_Base;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Widget_Base;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Applied_Global_Classes_Usage {
	private $total_count = 0;
	private $count_per_type = [];

	/**
	 * Get data about how global classes are applied across Elementor elements.
	 *
	 * @return array{count: int, element_types: array<string, int>} Statistics about applied global classes
	 */
	public function get() {
		$elementor_posts = $this->get_elementor_posts();

		$this->process_posts_data( $elementor_posts );

		return [
			'total_count' => $this->total_count,
			'count_per_type' => $this->count_per_type,
		];
	}

	private function process_posts_data( $elementor_posts ) {
		$global_class_ids = Global_Classes_Repository::make()->all()->get_items()->keys()->all();

		foreach ( $elementor_posts as $post ) {
			$document = Plugin::$instance->documents->get( $post->ID );
			$elements_data = $document->get_json_meta( '_elementor_data' );

			$this->process_elements_data( $elements_data, $global_class_ids );
		}
	}

	private function process_elements_data( $elements_data, $global_class_ids ) {
		Plugin::$instance->db->iterate_data( $elements_data, function( $element_data ) use ( $global_class_ids ) {
			$element_type = $this->get_element_type( $element_data );

			$widget = Plugin::$instance->widgets_manager->get_widget_types( $element_type );
			$element = Plugin::$instance->elements_manager->get_element_types( $element_type );

			$element_instance = $widget ?? $element;

			if ( ! $element_instance ) {
				return;
			}

			if ( ! $element_instance instanceof Atomic_Element_Base &&
				! $element_instance instanceof Atomic_Widget_Base ) {
				return;
			}

			$classes_count = $this->get_classes_count_for_element( $element_instance->get_props_schema(), $element_data, $global_class_ids );

			if ( 0 === $classes_count ) {
				return;
			}

			$prev_count = $this->count_per_type[ $element_type ] ?? 0;

			$this->total_count += $classes_count;
			$this->count_per_type[ $element_type ] = $prev_count + $classes_count;
		});
	}

	private function get_classes_count_for_element( $atomic_props_schema, $atomic_element_data, $global_class_ids ) {
		return Collection::make( $atomic_props_schema )->reduce( function( $carry, $prop, $prop_name ) use ( $atomic_element_data, $global_class_ids ) {
			if ( 'plain' === $prop::KIND && 'classes' === $prop->get_key() ) {
				if ( isset( $atomic_element_data['settings'][ $prop_name ] ) ) {
					$carry += count( array_intersect( $atomic_element_data['settings'][ $prop_name ]['value'], $global_class_ids ) );
				}
			}

			return $carry;
		}, 0 );
	}

	private function get_element_type( $element ) {
		return 'widget' === $element['elType'] ? $element['widgetType'] : $element['elType'];
	}

	private function get_elementor_posts() {
		$args = wp_parse_args( [
			'post_type' => 'any',
			'post_status' => [ 'publish' ],
			'posts_per_page' => '-1',
			'meta_key' => '_elementor_edit_mode',
			'meta_value' => 'builder',
		] );

		$query = new \WP_Query( $args );

		return $query->get_posts();
	}
}
