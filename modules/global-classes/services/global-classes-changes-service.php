<?php

namespace Elementor\Modules\GlobalClasses\Services;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Global_Classes_Changes_Service {
	/**
	 * Checks if changes arrays are empty
	 *
	 * @param array $changes Changes array from request
	 * @return bool True if there are non-empty arrays, false otherwise
	 */
	public function has_changes( $changes ) {
		if ( ! is_array( $changes ) ) {
			error_log( 'Elementor REST API Debug - Changes is not an array: ' . json_encode( $changes, JSON_PRETTY_PRINT ) );
			return false;
		}

		$has_non_empty_arrays = false;

		foreach ( $changes as $key => $value ) {
			if ( is_array( $value ) && ! empty( $value ) ) {
				$has_non_empty_arrays = true;
				break;
			}
		}

		if ( ! $has_non_empty_arrays ) {
			error_log( 'Elementor REST API Debug - All arrays in changes are empty: ' . json_encode( $changes, JSON_PRETTY_PRINT ) );
		}

		return $has_non_empty_arrays;
	}

	/**
	 * Builds response data with information about changes made
	 *
	 * @param array $changes Changes array from request
	 * @param array|null $validation_result Validation result with modified labels
	 * @return array Response data
	 */
	public function build_response_data( $changes, $validation_result = null ) {
		$response_data = [
			'message' => __( 'Global classes saved successfully.', 'elementor' ),
			'added_count' => count( $changes['added'] ?? [] ),
			'modified_count' => count( $changes['modified'] ?? [] ),
			'deleted_count' => count( $changes['deleted'] ?? [] ),
		];

		// Add information about modified labels if any
		if ( $validation_result && ! empty( $validation_result['meta']['modifiedLabels'] ) ) {
			$response_data['code'] = 'DUPLICATED_LABEL';
			$response_data['message'] = $validation_result['message'];
			$response_data['modifiedLabels'] = $validation_result['meta']['modifiedLabels'];
			$response_data['duplicate_labels_handled'] = count( $validation_result['meta']['modifiedLabels'] );
		}

		return $response_data;
	}

	/**
	 * Builds response metadata with total changes count
	 *
	 * @param array $changes Changes array from request
	 * @return array Response metadata
	 */
	public function build_response_meta( $changes ) {
		return [
			'total_changes' => array_sum( [
				count( $changes['added'] ?? [] ),
				count( $changes['modified'] ?? [] ),
				count( $changes['deleted'] ?? [] ),
			] ),
		];
	}
}
