<?php
namespace Elementor\Modules\GlobalClasses;

use Elementor\Core\Base\Document;
use Elementor\Core\Utils\Collection;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Element_Base;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Widget_Base;
use Elementor\Modules\GlobalClasses\Utils\Elements_Classes;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Global_Classes_Cleanup {

    public function register_hooks() {
		add_action(
			'elementor/global_classes/update',
			fn( $context, $new_value, $prev_value ) => $this->on_classes_update( $new_value, $prev_value ),
            10,
            3
		);
	}

	public function on_classes_update( $new_value, $prev_value ) {

		$deleted_class_ids = $this->get_deleted_class_ids( $new_value, $prev_value );

		if ( ! empty( $deleted_class_ids ) ) {
			Elements_Classes::iterate_data( fn( $document, $elements_data ) => $this->handle_deleted_classes( $document, $elements_data, $deleted_class_ids ) );
		}

	}

	private function handle_deleted_classes( $document, $elements_data, $deleted_class_ids ) {
        $elements_data = $this->unapply_deleted_classes( $elements_data, $deleted_class_ids );

        $document->update_meta( Document::ELEMENTOR_DATA_META_KEY, $elements_data );
    }

	private function unapply_deleted_classes( $elements_data, $deleted_class_ids ) {
		return Plugin::$instance->db->iterate_data( $elements_data, function( $element_data ) use ( $deleted_class_ids ) {
			$element_type = Elements_Classes::get_element_type( $element_data );
			$element_instance = Elements_Classes::get_element_instance( $element_type );

			if ( ! Elements_Classes::is_atomic_element( $element_instance ) ) {
				return $element_data;
			}

			/** @var Atomic_Element_Base | Atomic_Widget_Base $element_instance */
			return $this->delete_classes_from_element( $element_instance->get_props_schema(), $element_data, $deleted_class_ids );
		} );
	}

	private function get_deleted_class_ids( $updated_value, $current_value ) {
		$deleted_class_ids = [];

		foreach ( $current_value['items'] as $class_id => $class_data ) {
			if ( ! isset( $updated_value['items'][ $class_id ] ) ) {
				$deleted_class_ids[] = $class_id;
			}
		}

		return $deleted_class_ids;
	}

	private function delete_classes_from_element( $atomic_props_schema, $atomic_element_data, $class_ids ) {
		$element_data = $atomic_element_data;

		foreach ( $atomic_props_schema as $prop ) {
			if ( ! Elements_Classes::is_classes_prop( $prop ) ) {
				continue;
			}

			if ( ! isset( $element_data['settings'][ $prop->get_key() ] ) ) {
				continue;
			}

			$current_classes = $element_data['settings'][ $prop->get_key() ]['value'];

			$filtered_classes = array_filter(
				$current_classes,
				fn( $class ) => ! in_array( $class, $class_ids, true )
			);

			$element_data['settings'][ $prop->get_key() ]['value'] = array_values( $filtered_classes );

		}

		return $element_data;
	}
}
