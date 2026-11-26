<?php

namespace Elementor\Modules\GlobalClasses\Utils;

use Elementor\Core\Utils\Template_Library_Element_Iterator;
use Elementor\Core\Utils\Template_Library_Import_Export_Utils;
use Elementor\Core\Utils\Template_Library_Snapshot_Processor;
use Elementor\Modules\GlobalClasses\Global_Classes_Lock;
use Elementor\Modules\GlobalClasses\Global_Classes_Parser;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Modules\GlobalClasses\Global_Classes_Rest_Api;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Template_Library_Global_Classes_Snapshot_Builder extends Template_Library_Snapshot_Processor {

	private static ?self $instance = null;

	public static function make(): self {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

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
		if ( empty( $ids ) || ! self::make()->can_access_repository() ) {
			return null;
		}

		$ids = Template_Library_Import_Export_Utils::normalize_string_ids( $ids );

		if ( empty( $ids ) ) {
			return null;
		}

		$repository = Global_Classes_Repository::make()->set_preview( false );
		$order = $repository->get_order();
		$filtered_order = array_values( array_filter( $order, fn( $id ) => in_array( $id, $ids, true ) ) );
		$filtered_items = $repository->get_by_ids( $ids );

		if ( empty( $filtered_items ) ) {
			return null;
		}

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

	/**
	 * @return array Operation result. When the global classes lock is busy nothing is written and
	 *               the result holds a `WP_Error` under the `error` key.
	 */
	public static function merge_snapshot_and_get_id_map( array $snapshot ): array {
		return self::run_with_lock( function () use ( $snapshot ) {
			return self::make()->merge_and_get_id_map( $snapshot );
		} );
	}

	/**
	 * @return array Operation result. When the global classes lock is busy nothing is written and
	 *               the result holds a `WP_Error` under the `error` key.
	 */
	public static function create_snapshot_as_new( array $snapshot ): array {
		return self::run_with_lock( function () use ( $snapshot ) {
			return self::make()->create_all_as_new( $snapshot );
		} );
	}

	/**
	 * The import reads the current classes and then writes the index, the same read-modify-write
	 * as a REST save, so it takes the same lock. Incoming classes are never flattened when the
	 * lock is busy: that would hide a failed global save inside a successful import.
	 */
	private static function run_with_lock( callable $operation ): array {
		$kit = Plugin::instance()->kits_manager->get_active_kit();
		$kit_id = $kit ? (int) $kit->get_main_id() : 0;

		// Without a kit there is no shared index to protect, so there is nothing to lock.
		if ( ! $kit_id ) {
			return $operation();
		}

		$lock_token = Global_Classes_Lock::acquire( $kit_id );

		if ( null === $lock_token ) {
			return array_merge( self::make()->get_empty_result(), [
				'error' => new \WP_Error(
					Global_Classes_Lock::ERROR_CODE,
					__( 'Global classes are currently being updated by another request. Please try again.', 'elementor' ),
					[ 'status' => 409 ]
				),
			] );
		}

		try {
			return $operation();
		} finally {
			Global_Classes_Lock::release( $kit_id, $lock_token );
		}
	}

	protected function is_matching_item( array $existing_item, array $incoming_item ): bool {
		// For global classes, if the labels match, we consider them the same item
		// when merging, so we reuse the existing class and ignore incoming variants or extra fields.
		return true;
	}

	protected function normalize_for_comparison( array $item ): array {
		$id = $item['id'] ?? '';

		if ( '' === $id ) {
			return $item;
		}

		$parsed = self::parse_snapshot_or_null( [
			'items' => [ $id => $item ],
			'order' => [ $id ],
		] );

		if ( null !== $parsed && isset( $parsed['items'][ $id ] ) ) {
			return $parsed['items'][ $id ];
		}

		return $item;
	}

	protected function get_item_prefix(): string {
		return Template_Library_Import_Export_Utils::GLOBAL_CLASS_ID_PREFIX;
	}

	protected function get_max_items(): int {
		return Global_Classes_Rest_Api::MAX_ITEMS;
	}

	protected function can_access_repository(): bool {
		return class_exists( Global_Classes_Repository::class ) && $this->has_active_kit();
	}

	protected function load_current_data(): array {
		$repository = Global_Classes_Repository::make()->set_preview( true );
		$labels = $repository->all_labels();

		$items = [];
		foreach ( $labels as $id => $label ) {
			$items[ $id ] = [
				'id' => $id,
				'label' => $label,
			];
		}

		return [
			'items' => $items,
			'order' => $repository->get_order(),
		];
	}

	protected function parse_incoming_snapshot( array $snapshot ): ?array {
		return self::parse_snapshot_or_null( $snapshot );
	}

	protected function get_incoming_items( array $parsed_snapshot ): array {
		$items = [];
		$order = $parsed_snapshot['order'] ?? array_keys( $parsed_snapshot['items'] ?? [] );

		foreach ( $order as $id ) {
			if ( isset( $parsed_snapshot['items'][ $id ] ) ) {
				$items[ $id ] = $parsed_snapshot['items'][ $id ];
			}
		}

		return $items;
	}

	protected function count_current_items( array $items ): int {
		return count( $items );
	}

	protected function save_data( array $data, array $metadata ): array {
		$new_items = $data['new_items'] ?? [];
		$order = $data['order'] ?? [];

		if ( empty( $new_items ) ) {
			return [
				'global_classes' => [
					'added_items' => [],
					'added_items_order' => [],
				],
			];
		}

		$repository = Global_Classes_Repository::make()->set_preview( false );
		$added_ids = array_keys( $new_items );

		$repository->apply_changes(
			$new_items,
			[
				'added' => $added_ids,
				'order' => true,
			],
			$order
		);

		return [
			'global_classes' => [
				'added_items_order' => $added_ids,
				'added_items' => $new_items,
			],
		];
	}

	protected function prepare_item_for_save( array $item, string $target_id ): array {
		$item['id'] = $target_id;
		return $item;
	}

	private function has_active_kit(): bool {
		return (bool) Plugin::instance()->kits_manager->get_active_kit();
	}

	private static function parse_snapshot_or_null( array $snapshot ): ?array {
		$snapshot['order'] = Global_Classes_Parser::sanitize_order(
			$snapshot['items'] ?? [],
			$snapshot['order'] ?? []
		);

		$parse_result = Global_Classes_Parser::make()->parse( $snapshot );
		if ( ! $parse_result->is_valid() ) {
			return null;
		}

		return $parse_result->unwrap();
	}
}
