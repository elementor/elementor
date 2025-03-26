<?php

namespace Elementor\Modules\Global_Classes\Usage;

use Elementor\Modules\AtomicWidgets\Elements\Atomic_Element_Base;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Widget_Base;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Applied_Global_Classes_Usage {
	private $count = 0;
	private $element_types = [];

	/**
	 * Get data about how global classes are applied across Elementor elements.
	 *
	 * @return array{count: int, element_types: array<string, int>} Statistics about applied global classes
	 */
	public function get() {
		$elementor_posts = $this->get_elementor_posts();

		$this->process_posts_data( $elementor_posts );

		return [
			'count' => $this->count,
			'element_types' => $this->element_types,
		];
	}

	private function process_posts_data( $elementor_posts ) {
		$global_class_ids = Global_Classes_Repository::make()->all()->get_items()->keys()->all();

		foreach ( $elementor_posts as $post ) {
			$document = Plugin::$instance->documents->get( $post->ID );
			$element_data = $document->get_json_meta( '_elementor_data' );
			$raw_data = $document->get_elements_raw_data( $element_data );

			$this->process_elements_data( $raw_data, $global_class_ids );
		}
	}

	private function process_elements_data( $elements_data, $global_class_ids ) {
		Plugin::$instance->db->iterate_data( $elements_data, function( $element ) use ( $global_class_ids ) {
			$classes_count = $this->get_element_classes_count( $element );

			if ( 0 === $classes_count ) {
				return;
			}

			$element_type = $this->get_element_type( $element );
			$element_types_count = $this->element_types[ $element_type ] ?? 0;

			$this->count += $classes_count;
			$this->element_types[ $element_type ] = $element_types_count + $classes_count;
		});
	}

	private function get_element_classes_count( $element_data ) {
		$element_type = $this->get_element_type( $element_data );

		$widget = Plugin::$instance->widgets_manager->get_widget_types( $element_type );
		$element = Plugin::$instance->elements_manager->get_element_types( $element_type );

		$element_instance = $widget ?? $element;

		if ( ! $element_instance ) {
			return 0;
		}

		if ( ! $element_instance instanceof Atomic_Element_Base &&
			! $element_instance instanceof Atomic_Widget_Base ) {
			return 0;
		}

		$props_schema = $element_instance->get_props_schema();

		$classes = 0;

		foreach ( $props_schema as $prop_name => $prop ) {
			if ( 'plain' === $prop::KIND && 'classes' === $prop->get_key() ) {
				if ( isset( $element_data['settings'][ $prop_name ] ) ) {
					$classes += count( $element_data['settings'][ $prop_name ]['value'] );
				}
			}
		}

		return $classes;
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
