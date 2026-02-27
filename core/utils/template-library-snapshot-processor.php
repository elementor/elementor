<?php

namespace Elementor\Core\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

abstract class Template_Library_Snapshot_Processor {

	abstract protected function get_item_prefix(): string;
	abstract protected function get_max_items(): int;
	abstract protected function can_access_repository(): bool;
	abstract protected function load_current_data(): array;
	abstract protected function parse_incoming_snapshot( array $snapshot ): ?array;
	abstract protected function get_incoming_items( array $parsed_snapshot ): array;
	abstract protected function count_current_items( array $items ): int;
	abstract protected function save_data( array $items, array $metadata ): array;

	protected function get_comparison_ignore_keys(): array {
		return [];
	}

	protected function normalize_for_comparison( array $item ): array {
		return $item;
	}

	protected function get_empty_result(): array {
		return [
			'id_map' => [],
			'ids_to_flatten' => [],
		];
	}

	public function merge_and_get_id_map( array $snapshot ): array {
		if ( ! $this->can_access_repository() ) {
			return $this->get_empty_result();
		}

		$parsed = $this->parse_incoming_snapshot( $snapshot );
		if ( null === $parsed ) {
			return $this->get_empty_result();
		}

		$current = $this->load_current_data();
		$current_items = $current['items'] ?? [];
		$existing_labels = Template_Library_Import_Export_Utils::extract_labels( $current_items );
		$label_to_id = Template_Library_Import_Export_Utils::build_label_to_id_index( $current_items );
		$ignore_keys = $this->get_comparison_ignore_keys();

		$id_map = [];
		$ids_to_flatten = [];
		$updated_items = $current_items;
		$existing_ids = array_fill_keys( array_keys( $updated_items ), true );
		$updated_order = $current['order'] ?? [];

		$incoming_items = $this->get_incoming_items( $parsed );

		foreach ( $incoming_items as $incoming_id => $incoming_item ) {
			if ( empty( $incoming_item ) ) {
				continue;
			}

			$incoming_label = $incoming_item['label'] ?? null;
			$matching_id = is_string( $incoming_label ) ? ( $label_to_id[ $incoming_label ] ?? null ) : null;

			if ( null !== $matching_id && isset( $updated_items[ $matching_id ] ) ) {
				$is_same = Template_Library_Import_Export_Utils::items_equal_ignoring_keys(
					$this->normalize_for_comparison( $updated_items[ $matching_id ] ),
					$incoming_item,
					$ignore_keys
				);

				if ( $is_same ) {
					if ( $matching_id !== $incoming_id ) {
						$id_map[ $incoming_id ] = $matching_id;
					}
					continue;
				}
			}

			if ( $this->count_current_items( $updated_items ) >= $this->get_max_items() ) {
				$ids_to_flatten[] = $incoming_id;
				continue;
			}

			if ( null !== $matching_id && isset( $updated_items[ $matching_id ] ) ) {
				$target_id = Template_Library_Import_Export_Utils::generate_unique_id(
					array_keys( $updated_items ),
					$this->get_item_prefix()
				);
			} elseif ( isset( $existing_ids[ $incoming_id ] ) ) {
				$target_id = Template_Library_Import_Export_Utils::generate_unique_id(
					array_keys( $updated_items ),
					$this->get_item_prefix()
				);
			} else {
				$target_id = $incoming_id;
			}

			if ( $target_id !== $incoming_id ) {
				$id_map[ $incoming_id ] = $target_id;
			}

			$this->add_item_with_label(
				$incoming_item,
				$target_id,
				$updated_items,
				$existing_ids,
				$existing_labels,
				$updated_order
			);

			$new_label = $updated_items[ $target_id ]['label'] ?? null;
			if ( is_string( $new_label ) && ! isset( $label_to_id[ $new_label ] ) ) {
				$label_to_id[ $new_label ] = $target_id;
			}
		}

		$saved_result = $this->save_data( $updated_items, array_merge( $current, [ 'order' => $updated_order ] ) );

		return array_merge( $this->get_empty_result(), [
			'id_map' => $id_map,
			'ids_to_flatten' => $ids_to_flatten,
		], $saved_result );
	}

	public function create_all_as_new( array $snapshot ): array {
		return $this->process_snapshot( $snapshot, function ( $incoming_id, $incoming_item, $updated_items, $existing_ids ) {
			return Template_Library_Import_Export_Utils::generate_unique_id( array_keys( $updated_items ), $this->get_item_prefix() );
		} );
	}

	protected function process_snapshot( array $snapshot, callable $id_strategy ): array {
		if ( ! $this->can_access_repository() ) {
			return $this->get_empty_result();
		}

		$parsed = $this->parse_incoming_snapshot( $snapshot );
		if ( null === $parsed ) {
			return $this->get_empty_result();
		}

		$current = $this->load_current_data();
		$current_items = $current['items'] ?? [];
		$existing_labels = Template_Library_Import_Export_Utils::extract_labels( $current_items );

		$id_map = [];
		$ids_to_flatten = [];
		$updated_items = $current_items;
		$existing_ids = array_fill_keys( array_keys( $updated_items ), true );
		$updated_order = $current['order'] ?? [];

		$incoming_items = $this->get_incoming_items( $parsed );

		foreach ( $incoming_items as $incoming_id => $incoming_item ) {
			if ( empty( $incoming_item ) ) {
				continue;
			}

			if ( $this->count_current_items( $updated_items ) >= $this->get_max_items() ) {
				$ids_to_flatten[] = $incoming_id;
				continue;
			}

			$target_id = $id_strategy( $incoming_id, $incoming_item, $updated_items, $existing_ids );

			if ( null === $target_id ) {
				continue;
			}

			if ( $target_id !== $incoming_id ) {
				$id_map[ $incoming_id ] = $target_id;
			}

			$this->add_item_with_label(
				$incoming_item,
				$target_id,
				$updated_items,
				$existing_ids,
				$existing_labels,
				$updated_order
			);
		}

		$saved_result = $this->save_data( $updated_items, array_merge( $current, [ 'order' => $updated_order ] ) );

		return array_merge( $this->get_empty_result(), [
			'id_map' => $id_map,
			'ids_to_flatten' => $ids_to_flatten,
		], $saved_result );
	}

	protected function add_item_with_label( array $item, string $target_id, array &$updated_items, array &$existing_ids, array &$existing_labels, array &$updated_order ): void {
		$item = $this->prepare_item_for_save( $item, $target_id );
		$item = Template_Library_Import_Export_Utils::apply_unique_label( $item, $existing_labels );
		$updated_items[ $target_id ] = $item;
		$existing_ids[ $target_id ] = true;

		if ( ! in_array( $target_id, $updated_order, true ) ) {
			$updated_order[] = $target_id;
		}
	}

	protected function prepare_item_for_save( array $item, string $target_id ): array {
		return $item;
	}
}
