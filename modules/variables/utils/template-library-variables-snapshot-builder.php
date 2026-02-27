<?php

namespace Elementor\Modules\Variables\Utils;

use Elementor\Core\Utils\Template_Library_Element_Iterator;
use Elementor\Core\Utils\Template_Library_Import_Export_Utils;
use Elementor\Core\Utils\Template_Library_Snapshot_Processor;
use Elementor\Modules\Variables\Storage\Constants;
use Elementor\Modules\Variables\Storage\Variables_Collection;
use Elementor\Modules\Variables\Storage\Variables_Repository;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Template_Library_Variables_Snapshot_Builder extends Template_Library_Snapshot_Processor {

	private static ?self $instance = null;
	private ?Variables_Repository $repository = null;

	public static function make(): self {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	public static function extract_used_variable_ids_from_elements( array $elements ): array {
		$ids = [];
		$variable_types = Variable_Type_Keys::get_all();

		if ( empty( $elements ) ) {
			return [];
		}

		Template_Library_Element_Iterator::iterate(
			$elements,
			function ( $element_data ) use ( &$ids, $variable_types ) {
				self::collect_variable_ids_from_element( $element_data, $ids, $variable_types );
				return $element_data;
			}
		);

		return array_values( array_unique( $ids ) );
	}

	public static function build_snapshot_for_ids( array $ids ): ?array {
		if ( empty( $ids ) ) {
			return null;
		}

		$instance = self::make();
		if ( ! $instance->can_access_repository() ) {
			return null;
		}

		$ids = Template_Library_Import_Export_Utils::normalize_string_ids( $ids );
		if ( empty( $ids ) ) {
			return null;
		}

		$all_data = $instance->load_current_data();
		$all_variables = $all_data['items'] ?? [];
		$filtered_data = Template_Library_Import_Export_Utils::filter_items_by_ids( $all_variables, $ids );

		if ( empty( $filtered_data ) ) {
			return null;
		}

		return self::build_snapshot_from_data(
			$filtered_data,
			$all_data['version'] ?? Constants::FORMAT_VERSION_V1
		);
	}

	public static function build_snapshot_for_elements( array $elements, ?array $global_classes_snapshot = null ): ?array {
		$ids = self::extract_used_variable_ids_from_elements( $elements );

		if ( ! empty( $global_classes_snapshot ) ) {
			$ids_from_classes = self::extract_variable_ids_from_data( $global_classes_snapshot );
			$ids = array_merge( $ids, $ids_from_classes );
		}

		$ids = array_values( array_unique( $ids ) );

		if ( empty( $ids ) ) {
			return null;
		}

		return self::build_snapshot_for_ids( $ids );
	}

	public static function extract_variable_ids_from_data( array $data ): array {
		$ids = [];
		$variable_types = Variable_Type_Keys::get_all();
		self::extract_variable_ids_recursive( $data, $ids, $variable_types );
		return array_values( array_unique( $ids ) );
	}

	public static function merge_snapshot_and_get_id_map( array $snapshot ): array {
		return self::make()->merge_and_get_id_map( $snapshot );
	}

	public static function create_snapshot_as_new( array $snapshot ): array {
		return self::make()->create_all_as_new( $snapshot );
	}

	protected function get_item_prefix(): string {
		return 'e-gv-';
	}

	protected function get_max_items(): int {
		return Constants::TOTAL_VARIABLES_COUNT;
	}

	protected function can_access_repository(): bool {
		$this->repository = $this->get_repository_or_null();
		return null !== $this->repository;
	}

	protected function load_current_data(): array {
		if ( ! $this->repository ) {
			$this->repository = $this->get_repository_or_null();
		}

		if ( ! $this->repository ) {
			return [
				'items' => [],
				'order' => [],
				'watermark' => 0,
				'version' => Constants::FORMAT_VERSION_V1,
			];
		}

		$collection = $this->repository->load();
		$serialized = $collection->serialize();

		return [
			'items' => $serialized['data'] ?? [],
			'order' => [],
			'watermark' => $serialized['watermark'] ?? 0,
			'version' => $serialized['version'] ?? Constants::FORMAT_VERSION_V1,
		];
	}

	protected function parse_incoming_snapshot( array $snapshot ): ?array {
		$incoming_data = $snapshot['data'] ?? [];
		if ( empty( $incoming_data ) ) {
			return null;
		}
		return $snapshot;
	}

	protected function get_incoming_items( array $parsed_snapshot ): array {
		return $parsed_snapshot['data'] ?? [];
	}

	protected function count_current_items( array $items ): int {
		$count = 0;
		foreach ( $items as $item ) {
			if ( empty( $item['deleted'] ) ) {
				++$count;
			}
		}
		return $count;
	}

	protected function save_data( array $items, array $metadata ): array {
		$updated_collection = Variables_Collection::hydrate( [
			'data' => $items,
			'watermark' => $metadata['watermark'] ?? 0,
			'version' => $metadata['version'] ?? Constants::FORMAT_VERSION_V1,
		] );

		$this->repository->save( $updated_collection );

		return [
			'variables' => [
				'data' => $items,
				'watermark' => $updated_collection->watermark(),
			],
		];
	}

	private static function extract_variable_ids_recursive( $data, array &$ids, array $variable_types ): void {
		if ( ! is_array( $data ) ) {
			return;
		}

		if ( isset( $data['$$type'] ) && in_array( $data['$$type'], $variable_types, true ) ) {
			if ( isset( $data['value'] ) && is_string( $data['value'] ) && '' !== $data['value'] ) {
				$ids[] = $data['value'];
			}
		}

		foreach ( $data as $value ) {
			if ( is_array( $value ) ) {
				self::extract_variable_ids_recursive( $value, $ids, $variable_types );
			}
		}
	}

	private static function collect_variable_ids_from_element( array $element_data, array &$ids, array $variable_types ): void {
		if ( ! empty( $element_data['settings'] ) && is_array( $element_data['settings'] ) ) {
			self::extract_variable_ids_recursive( $element_data['settings'], $ids, $variable_types );
		}

		if ( ! empty( $element_data['styles'] ) && is_array( $element_data['styles'] ) ) {
			self::extract_variable_ids_recursive( $element_data['styles'], $ids, $variable_types );
		}
	}

	private function get_repository_or_null(): ?Variables_Repository {
		$kit = Plugin::instance()->kits_manager->get_active_kit();
		if ( ! $kit ) {
			return null;
		}

		return new Variables_Repository( $kit );
	}

	private static function build_snapshot_from_data( array $data, int $version ): array {
		return [
			'data' => $data,
			'watermark' => 0,
			'version' => $version,
		];
	}
}
