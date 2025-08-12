<?php

namespace Elementor\Modules\GlobalClasses\Services;

use Elementor\Modules\GlobalClasses\Utils\Error_Builder;
use Elementor\Modules\GlobalClasses\Global_Classes_Errors;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Global_Classes_Validation_Service {
	const MAX_ITEMS = 50;

	/**
	 * Validates new items labels and handles duplicates
	 *
	 * @param array $request_items Items from the request
	 * @param array $existing_items Existing items from database
	 * @param array $changes Changes being made
	 * @return array Validation result with modified items and metadata
	 */
	public function validate_new_items_labels( $request_items, $existing_items, $changes ) {
		// If no changes are being made, validation passes
		if ( empty( $changes['added'] ) ) {
			return [
				'is_valid' => true,
				'message' => '',
				'meta' => [
					'modifiedLabels' => [],
				],
				'items' => $request_items,
			];
		}

		// Get existing labels from database
		$existing_labels = array_column( $existing_items, 'label' );

		// Get all current labels (including existing and new items)
		$all_current_labels = [];
		foreach ( $request_items as $item_id => $item ) {
			$label = $item['label'] ?? '';
			if ( ! empty( $label ) ) {
				$all_current_labels[ $item_id ] = $label;
			}
		}

		// Get new items that are being added
		$added_item_ids = $changes['added'] ?? [];
		$modified_items = $request_items;
		$modified_labels = [];

		foreach ( $added_item_ids as $item_id ) {
			if ( ! isset( $request_items[ $item_id ] ) ) {
				continue;
			}

			$new_item = $request_items[ $item_id ];
			$new_label = $new_item['label'] ?? '';

			// Skip empty labels
			if ( empty( $new_label ) ) {
				continue;
			}

			// Check if label already exists in database OR in current request
			$is_duplicate = false;

			// Check against existing database labels
			if ( in_array( $new_label, $existing_labels, true ) ) {
				$is_duplicate = true;
			}

			// Check against other items in the current request
			foreach ( $all_current_labels as $other_item_id => $other_label ) {
				if ( $other_item_id !== $item_id && $other_label === $new_label ) {
					$is_duplicate = true;
					break;
				}
			}

			if ( $is_duplicate ) {
				$label_service = new Global_Classes_Label_Service();
				$modified_label = $label_service->generate_unique_label( $new_label, array_values( $all_current_labels ) );

				$modified_items[ $item_id ]['label'] = $modified_label;

				$modified_labels[] = [
					'original' => $new_label,
					'modified' => $modified_label,
					'id' => $item_id,
				];

				// Update the all_current_labels array to reflect the change
				$all_current_labels[ $item_id ] = $modified_label;
			}
		}

		return [
			'is_valid' => true,
			'message' => empty( $modified_labels ) ? '' : sprintf(
				__( 'Modified %d duplicate labels automatically.', 'elementor' ),
				count( $modified_labels )
			),
			'meta' => [
				'modifiedLabels' => $modified_labels,
			],
			'items' => $modified_items,
		];
	}

	/**
	 * Performs final validation check right before saving to handle concurrency issues
	 *
	 * @param array $items Items to be saved
	 * @param array $fresh_existing_items Fresh items from database
	 * @param array $changes Changes being made
	 * @return array Result with has_changes, items, and validation_result
	 */
	public function perform_final_validation( $items, $fresh_existing_items, $changes ) {
		// Get added items from the request
		$added_item_ids = $changes['added'] ?? [];

		$has_changes = false;
		$modified_items = $items;
		$modified_labels = [];

		// Check each added item against fresh database state
		foreach ( $added_item_ids as $item_id ) {
			if ( ! isset( $items[ $item_id ] ) ) {
				continue;
			}

			$item = $items[ $item_id ];
			$original_label = $item['label'] ?? '';

			if ( empty( $original_label ) ) {
				continue;
			}

			// Check if label exists in fresh database state
			$existing_labels = array_column( $fresh_existing_items, 'label' );
			$is_duplicate = in_array( $original_label, $existing_labels, true );

			// Also check against other items in the current request
			foreach ( $items as $other_item_id => $other_item ) {
				if ( $other_item_id !== $item_id && ( $other_item['label'] ?? '' ) === $original_label ) {
					$is_duplicate = true;
					break;
				}
			}

			if ( $is_duplicate ) {
				$has_changes = true;

				// Get all current labels (including fresh database and current items)
				$all_current_labels = array_merge(
					$existing_labels,
					array_column( $items, 'label' )
				);

				$label_service = new Global_Classes_Label_Service();
				$modified_label = $label_service->generate_unique_label( $original_label, array_values( $all_current_labels ) );

				$modified_items[ $item_id ]['label'] = $modified_label;

				$modified_labels[] = [
					'original' => $original_label,
					'modified' => $modified_label,
					'id' => $item_id,
				];

				// Log the concurrency resolution
				error_log( sprintf(
					'Elementor Global Classes: Concurrency resolved - "%s" changed to "%s"',
					$original_label,
					$modified_label
				) );
			}
		}

		return [
			'has_changes' => $has_changes,
			'items' => $modified_items,
			'validation_result' => [
				'is_valid' => true,
				'message' => empty( $modified_labels ) ? '' : sprintf(
					__( 'Modified %d duplicate labels automatically.', 'elementor' ),
					count( $modified_labels )
				),
				'meta' => [
					'modifiedLabels' => $modified_labels,
				],
			],
		];
	}

	/**
	 * Validates items count against maximum limit
	 *
	 * @param array $items Items to validate
	 * @return \WP_Error|null Error if validation fails, null if passes
	 */
	public function validate_items_count( $items ) {
		$items_count = count( $items );

		if ( $items_count >= self::MAX_ITEMS ) {
			return Error_Builder::make( Global_Classes_Errors::ITEMS_LIMIT_EXCEEDED )
				->set_status( 400 )
				->set_meta( [
					'current_count' => $items_count,
					'max_allowed' => self::MAX_ITEMS,
				] )
				->set_message( sprintf(
					__( 'Global classes limit exceeded. Maximum allowed: %d', 'elementor' ),
					self::MAX_ITEMS
				) )
				->build();
		}

		return null;
	}
}
