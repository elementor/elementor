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

class Global_Classes_Repository {

	const META_KEY_FRONTEND = '_elementor_global_classes';
	const META_KEY_PREVIEW = '_elementor_global_classes_preview';

	const CONTEXT_FRONTEND = 'frontend';
	const CONTEXT_PREVIEW = 'preview';

	private string $context = self::CONTEXT_FRONTEND;

	public static function make(): Global_Classes_Repository {
		return new self();
	}

	public function context( string $context ): self {
		$this->context = $context;

		return $this;
	}

	public function all() {
		$meta_key = $this->get_meta_key();
		$all = $this->get_kit()->get_json_meta( $meta_key );

		$is_preview = static::META_KEY_PREVIEW === $meta_key;
		$is_empty = empty( $all );

		if ( $is_preview && $is_empty ) {
			$all = $this->get_kit()->get_json_meta( static::META_KEY_FRONTEND );
		}

		return Global_Classes::make( $all['items'] ?? [], $all['order'] ?? [] );
	}

	public function put( array $items, array $order ) {
		$current_value = $this->all()->get();

		$updated_value = [
			'items' => $items,
			'order' => $order,
		];

		// `update_metadata` fails for identical data, so we skip it.
		if ( $current_value === $updated_value ) {
			return;
		}

		$meta_key = $this->get_meta_key();
		$value = $this->get_kit()->update_json_meta( $meta_key, $updated_value );

		$should_delete_preview = static::META_KEY_FRONTEND === $meta_key;

		if ( $should_delete_preview ) {
			$this->get_kit()->delete_meta( static::META_KEY_PREVIEW );
		}

		if ( ! $value ) {
			throw new \Exception( 'Failed to update global classes' );
		}

		$deleted_class_ids = $this->get_deleted_class_ids( $current_value, $updated_value );

		if ( ! empty( $deleted_class_ids ) ) {
			Elements_Classes::iterate_data( $this->handle_deleted_classes( $deleted_class_ids ) );
		}

		do_action( 'elementor/global_classes/update', $this->context );
	}

	private function get_meta_key(): string {
		return static::CONTEXT_FRONTEND === $this->context
			? static::META_KEY_FRONTEND
			: static::META_KEY_PREVIEW;
	}

	private function get_kit() {
		return Plugin::$instance->kits_manager->get_active_kit();
	}

	private function handle_deleted_classes( $deleted_class_ids ) {
		return function ( $document, $elements_data ) use ( $deleted_class_ids ) {
			$json_meta_with_deleted_classes = $this->unapply_deleted_classes( $elements_data, $deleted_class_ids );

			$document->update_json_meta( Document::ELEMENTOR_DATA_META_KEY, $json_meta_with_deleted_classes );
		};
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
			
		});
	}

	private function get_deleted_class_ids( $current_value, $updated_value ) {
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
				fn($class) => ! in_array( $class, $class_ids, true )
			);

			$element_data['settings'][ $prop->get_key() ]['value'] = array_values( $filtered_classes );

		}

		return $element_data;
	}

}
