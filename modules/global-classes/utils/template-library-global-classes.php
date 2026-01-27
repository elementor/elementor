<?php

namespace Elementor\Modules\GlobalClasses\Utils;

use Elementor\Core\Utils\Template_Library_Import_Export_Utils;
use Elementor\Modules\GlobalClasses\Global_Classes_Parser;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Template_Library_Global_Classes {
	public static function extract_used_class_ids_from_elements( array $elements ): array {
		$ids = [];

		if ( empty( $elements ) ) {
			return [];
		}

		Plugin::$instance->db->iterate_data(
			$elements,
			function ( $element_data ) use ( &$ids ) {
				$class_values = $element_data['settings']['classes']['value'] ?? [];

				if ( is_array( $class_values ) ) {
					foreach ( $class_values as $class_id ) {
						if ( is_string( $class_id ) && '' !== $class_id ) {
							$ids[] = $class_id;
						}
					}
				}

				return $element_data;
			}
		);

		return array_values( array_unique( $ids ) );
	}

	public static function build_snapshot_for_ids( array $ids ): ?array {
		if ( empty( $ids ) || ! class_exists( Global_Classes_Repository::class ) ) {
			return null;
		}

		$kit = Plugin::$instance->kits_manager->get_active_kit();
		if ( ! $kit ) {
			return null;
		}

		$ids = array_values(
			array_unique(
				array_filter( $ids, fn( $id ) => is_string( $id ) && '' !== $id )
			)
		);

		if ( empty( $ids ) ) {
			return null;
		}

		$all = Global_Classes_Repository::make()->all()->get();
		$items = $all['items'] ?? [];
		$order = $all['order'] ?? [];

		$filtered_items = [];
		foreach ( $ids as $id ) {
			if ( isset( $items[ $id ] ) ) {
				$filtered_items[ $id ] = $items[ $id ];
			}
		}

		if ( empty( $filtered_items ) ) {
			return null;
		}

		$filtered_order = [];
		foreach ( $order as $id ) {
			if ( isset( $filtered_items[ $id ] ) ) {
				$filtered_order[] = $id;
			}
		}

		foreach ( array_keys( $filtered_items ) as $id ) {
			if ( ! in_array( $id, $filtered_order, true ) ) {
				$filtered_order[] = $id;
			}
		}

		$snapshot = [
			'items' => $filtered_items,
			'order' => $filtered_order,
		];

		$parse_result = Global_Classes_Parser::make()->parse( $snapshot );
		if ( ! $parse_result->is_valid() ) {
			return null;
		}

		return $parse_result->unwrap();
	}

	public static function build_snapshot_for_elements( array $elements ): ?array {
		$ids = self::extract_used_class_ids_from_elements( $elements );

		if ( empty( $ids ) ) {
			return null;
		}

		return self::build_snapshot_for_ids( $ids );
	}

	public static function merge_snapshot_and_get_id_map( array $snapshot ): array {
		if ( ! class_exists( Global_Classes_Repository::class ) ) {
			return [ 'id_map' => [] ];
		}

		$kit = Plugin::$instance->kits_manager->get_active_kit();
		if ( ! $kit ) {
			return [ 'id_map' => [] ];
		}

		$parse_result = Global_Classes_Parser::make()->parse( $snapshot );
		if ( ! $parse_result->is_valid() ) {
			return [ 'id_map' => [] ];
		}

		$snapshot = $parse_result->unwrap();

		$current = Global_Classes_Repository::make()->all()->get();
		$current_items = $current['items'] ?? [];
		$current_order = $current['order'] ?? [];

		$existing_labels = [];
		foreach ( $current_items as $item ) {
			if ( isset( $item['label'] ) && is_string( $item['label'] ) ) {
				$existing_labels[] = $item['label'];
			}
		}

		$id_map = [];
		$updated_items = $current_items;
		$updated_order = $current_order;

		$existing_ids = array_fill_keys( array_keys( $updated_items ), true );

		foreach ( $snapshot['order'] as $incoming_id ) {
			if ( empty( $snapshot['items'][ $incoming_id ] ) ) {
				continue;
			}

			$incoming_item = $snapshot['items'][ $incoming_id ];
			$target_id = $incoming_id;

			if ( isset( $existing_ids[ $incoming_id ] ) ) {
				$is_same = Template_Library_Import_Export_Utils::items_equal( $updated_items[ $incoming_id ], $incoming_item );

				if ( $is_same ) {
					continue;
				}

				$target_id = Template_Library_Import_Export_Utils::generate_unique_id( array_keys( $updated_items ), 'g-' );
				$id_map[ $incoming_id ] = $target_id;
			}

			$incoming_item['id'] = $target_id;

			if ( isset( $incoming_item['label'] ) && is_string( $incoming_item['label'] ) && '' !== $incoming_item['label'] ) {
				$label = $incoming_item['label'];

				if ( in_array( $label, $existing_labels, true ) ) {
					$label = Template_Library_Import_Export_Utils::generate_unique_label( $label, $existing_labels );
					$incoming_item['label'] = $label;
				}

				$existing_labels[] = $label;
			}

			$updated_items[ $target_id ] = $incoming_item;
			$existing_ids[ $target_id ] = true;

			if ( ! in_array( $target_id, $updated_order, true ) ) {
				$updated_order[] = $target_id;
			}
		}

		Global_Classes_Repository::make()->put( $updated_items, $updated_order );

		return [
			'id_map' => $id_map,
			'global_classes' => [
				'items' => $updated_items,
				'order' => $updated_order,
			],
		];
	}

	public static function rewrite_elements_classes_ids( array $elements, array $id_map ): array {
		if ( empty( $elements ) || empty( $id_map ) ) {
			return $elements;
		}

		return Plugin::$instance->db->iterate_data(
			$elements,
			function ( $element_data ) use ( $id_map ) {
				$class_values = $element_data['settings']['classes']['value'] ?? null;

				if ( ! is_array( $class_values ) ) {
					return $element_data;
				}

				$updated_values = [];

				foreach ( $class_values as $class_id ) {
					if ( ! is_string( $class_id ) || '' === $class_id ) {
						continue;
					}

					$updated_values[] = $id_map[ $class_id ] ?? $class_id;
				}

				$element_data['settings']['classes']['value'] = array_values( array_unique( $updated_values ) );

				return $element_data;
			}
		);
	}
}
