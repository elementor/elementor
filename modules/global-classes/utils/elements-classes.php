<?php

namespace Elementor\Modules\GlobalClasses\Utils;

use Elementor\Core\Base\Document;
use Elementor\Core\Utils\Collection;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Element_Base;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Widget_Base;
use Elementor\TemplateLibrary\Source_Local;
use Elementor\Plugin;

class Elements_Classes {

	public static function iterate_data( $callback ) {
		$batch_size = 100;
		$processed_posts = 0;

		while ( true ) {
			$args = wp_parse_args( [
				'post_type' => array( Source_Local::CPT, 'post', 'page' ),
				'post_status' => [ 'publish' ],
				'posts_per_page' => $batch_size,
				'meta_key' => Document::BUILT_WITH_ELEMENTOR_META_KEY,
				'meta_value' => 'builder',
				'offset' => $processed_posts,
				'fields' => 'ids',
			] );

			$query = new \WP_Query( $args );

			if ( empty( $query->posts ) ) {
				break;
			}

			foreach ( $query->posts as $post_id ) {
				$document = Plugin::$instance->documents->get( $post_id );
				$elements_data = $document->get_json_meta( Document::ELEMENTOR_DATA_META_KEY );

				$callback( $document, $elements_data );

				$processed_posts++;
			}

		}
	}

	public static function is_classes_prop( $prop ) {
		return 'plain' === $prop::KIND && 'classes' === $prop->get_key();
	}

	public static function get_element_type( $element ) {
		return 'widget' === $element['elType'] ? $element['widgetType'] : $element['elType'];
	}

	public static function get_element_instance( $element_type ) {
		$widget = Plugin::$instance->widgets_manager->get_widget_types( $element_type );
		$element = Plugin::$instance->elements_manager->get_element_types( $element_type );

		return $widget ?? $element;
	}

	public static function is_atomic_element( $element_instance ) {
		if ( ! $element_instance ) {
			return false;
		}

		return (
			$element_instance instanceof Atomic_Element_Base ||
			$element_instance instanceof Atomic_Widget_Base
		);
	}
}
