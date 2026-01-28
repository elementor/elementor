<?php

namespace Elementor\Modules\GlobalClasses\Utils;

use Elementor\Core\Utils\Template_Library_Element_Iterator;
use Elementor\Core\Utils\Template_Library_Import_Export_Utils;
use Elementor\Core\Utils\Template_Library_Snapshot_Utils;
use Elementor\Modules\GlobalClasses\Global_Classes_Parser;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Modules\GlobalClasses\Global_Classes_Rest_Api;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Template_Library_Global_Classes_Snapshot_Builder {

	public static function extract_used_class_ids_from_elements( array $elements ): array {
		$ids = [];

		if ( empty( $elements ) ) {
			return [];
		}

		Template_Library_Element_Iterator::iterate(
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
		if ( empty( $ids ) || ! self::can_access_repository() ) {
			return null;
		}

		$ids = Template_Library_Snapshot_Utils::normalize_string_ids( $ids );

		if ( empty( $ids ) ) {
			return null;
		}

		$current = self::get_repository_data();
		$filtered_items = Template_Library_Snapshot_Utils::filter_items_by_ids( $current['items'], $ids );

		if ( empty( $filtered_items ) ) {
			return null;
		}

		$filtered_order = Template_Library_Snapshot_Utils::build_filtered_order( $current['order'], $filtered_items );

		return self::parse_snapshot_or_null( [
			'items' => $filtered_items,
			'order' => $filtered_order,
		] );
	}

	public static function build_snapshot_for_elements( array $elements ): ?array {
		$ids = self::extract_used_class_ids_from_elements( $elements );

		if ( empty( $ids ) ) {
			return null;
		}

		return self::build_snapshot_for_ids( $ids );
	}

	public static function merge_snapshot_and_get_id_map( array $snapshot ): array {
		if ( ! self::can_access_repository() ) {
			return [ 'id_map' => [], 'ids_to_flatten' => [] ];
		}

		$snapshot = self::parse_snapshot_or_null( $snapshot );
		if ( null === $snapshot ) {
			return [ 'id_map' => [], 'ids_to_flatten' => [] ];
		}

		$current = self::get_repository_data();
		$current_items = $current['items'];
		$current_order = $current['order'];
		$existing_labels = Template_Library_Import_Export_Utils::extract_labels( $current_items );

		$id_map = [];
		$ids_to_flatten = [];
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

			if ( count( $updated_items ) >= Global_Classes_Rest_Api::MAX_ITEMS ) {
				$ids_to_flatten[] = $incoming_id;
				continue;
			}

			self::add_item_with_label(
				$incoming_item,
				$target_id,
				$updated_items,
				$updated_order,
				$existing_ids,
				$existing_labels
			);
		}

		Global_Classes_Repository::make()->put( $updated_items, $updated_order );

		return [
			'id_map' => $id_map,
			'ids_to_flatten' => $ids_to_flatten,
			'global_classes' => [
				'items' => $updated_items,
				'order' => $updated_order,
			],
		];
	}

	public static function create_all_as_new( array $snapshot ): array {
		if ( ! self::can_access_repository() ) {
			return [ 'id_map' => [], 'ids_to_flatten' => [] ];
		}

		$snapshot = self::parse_snapshot_or_null( $snapshot );
		if ( null === $snapshot ) {
			return [ 'id_map' => [], 'ids_to_flatten' => [] ];
		}

		$current = self::get_repository_data();
		$current_items = $current['items'];
		$current_order = $current['order'];
		$existing_labels = Template_Library_Import_Export_Utils::extract_labels( $current_items );

		$id_map = [];
		$ids_to_flatten = [];
		$updated_items = $current_items;
		$updated_order = $current_order;
		$existing_ids = array_fill_keys( array_keys( $updated_items ), true );

		foreach ( $snapshot['order'] as $incoming_id ) {
			if ( empty( $snapshot['items'][ $incoming_id ] ) ) {
				continue;
			}

			$incoming_item = $snapshot['items'][ $incoming_id ];

			if ( count( $updated_items ) >= Global_Classes_Rest_Api::MAX_ITEMS ) {
				$ids_to_flatten[] = $incoming_id;
				continue;
			}

			$new_id = Template_Library_Import_Export_Utils::generate_unique_id( array_keys( $updated_items ), 'g-' );
			$id_map[ $incoming_id ] = $new_id;

			self::add_item_with_label(
				$incoming_item,
				$new_id,
				$updated_items,
				$updated_order,
				$existing_ids,
				$existing_labels
			);
		}

		Global_Classes_Repository::make()->put( $updated_items, $updated_order );

		return [
			'id_map' => $id_map,
			'ids_to_flatten' => $ids_to_flatten,
			'global_classes' => [
				'items' => $updated_items,
				'order' => $updated_order,
			],
		];
	}

	private static function can_access_repository(): bool {
		return class_exists( Global_Classes_Repository::class ) && self::has_active_kit();
	}

	private static function has_active_kit(): bool {
		return (bool) Plugin::$instance->kits_manager->get_active_kit();
	}

	private static function parse_snapshot_or_null( array $snapshot ): ?array {
		$parse_result = Global_Classes_Parser::make()->parse( $snapshot );
		if ( ! $parse_result->is_valid() ) {
			return null;
		}

		return $parse_result->unwrap();
	}

	private static function get_repository_data(): array {
		$current = Global_Classes_Repository::make()->all()->get();

		return [
			'items' => $current['items'] ?? [],
			'order' => $current['order'] ?? [],
		];
	}

	private static function add_item_with_label( array $item, string $target_id, array &$updated_items, array &$updated_order, array &$existing_ids, array &$existing_labels ): void {
		$item['id'] = $target_id;
		$item = Template_Library_Import_Export_Utils::apply_unique_label( $item, $existing_labels );
		$updated_items[ $target_id ] = $item;
		$existing_ids[ $target_id ] = true;

		if ( ! in_array( $target_id, $updated_order, true ) ) {
			$updated_order[] = $target_id;
		}
	}
}
