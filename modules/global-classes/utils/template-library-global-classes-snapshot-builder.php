<?php

namespace Elementor\Modules\GlobalClasses\Utils;

use Elementor\Core\Utils\Template_Library_Element_Iterator;
use Elementor\Core\Utils\Template_Library_Import_Export_Utils;
use Elementor\Core\Utils\Template_Library_Snapshot_Processor;
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

		$current = self::make()->load_current_data();
		$filtered_items = Template_Library_Import_Export_Utils::filter_items_by_ids( $current['items'], $ids );

		if ( empty( $filtered_items ) ) {
			return null;
		}

		$filtered_order = Template_Library_Import_Export_Utils::build_filtered_order( $current['order'], $filtered_items );

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
		return self::make()->merge_and_get_id_map( $snapshot );
	}

	public static function create_snapshot_as_new( array $snapshot ): array {
		return self::make()->create_all_as_new( $snapshot );
	}

	protected function get_comparison_ignore_keys(): array {
		return [ 'id' ];
	}

	protected function get_item_prefix(): string {
		return 'g-';
	}

	protected function get_max_items(): int {
		return Global_Classes_Rest_Api::MAX_ITEMS;
	}

	protected function can_access_repository(): bool {
		return class_exists( Global_Classes_Repository::class ) && $this->has_active_kit();
	}

	protected function load_current_data(): array {
		$current = Global_Classes_Repository::make()->all()->get();

		return [
			'items' => $current['items'] ?? [],
			'order' => $current['order'] ?? [],
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

	protected function save_data( array $items, array $metadata ): array {
		$order = $metadata['order'] ?? [];

		Global_Classes_Repository::make()->put( $items, $order );

		return [
			'global_classes' => [
				'items' => $items,
				'order' => $order,
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
		$parse_result = Global_Classes_Parser::make()->parse( $snapshot );
		if ( ! $parse_result->is_valid() ) {
			return null;
		}

		return $parse_result->unwrap();
	}
}
