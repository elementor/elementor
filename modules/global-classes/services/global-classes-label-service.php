<?php

namespace Elementor\Modules\GlobalClasses\Services;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Global_Classes_Label_Service {
	const LABEL_PREFIX = 'DUP_';
	const MAX_LABEL_LENGTH = 50;

	/**
	 * Generates a unique label that respects the character limit
	 *
	 * @param string $original_label The original label
	 * @param array $existing_labels Array of existing labels
	 * @return string The modified unique label
	 */
	public function generate_unique_label( $original_label, $existing_labels ) {
		$prefix = self::LABEL_PREFIX;
		$max_length = self::MAX_LABEL_LENGTH;

		// Check if the original label already has a prefix
		$has_prefix = strpos( $original_label, $prefix ) === 0;

		if ( $has_prefix ) {
			// Extract the base label (remove existing prefix)
			$base_label = str_replace( $prefix, '', $original_label );

			// Find the next available number
			$counter = 1;
			$new_label = $prefix . $base_label . $counter;

			while ( true ) {
				$new_label_length = strlen( $new_label );
				if ( $new_label_length > $max_length || in_array( $new_label, $existing_labels, true ) ) {
					++$counter;
					$new_label = $prefix . $base_label . $counter;

					// If still too long, slice the base label
					$new_label_length = strlen( $new_label );
					if ( $new_label_length > $max_length ) {
						$available_length = $max_length - strlen( $prefix . $counter );
						$base_label = substr( $base_label, 0, $available_length );
						$new_label = $prefix . $base_label . $counter;
					}
				} else {
					break;
				}
			}
		} else {
			// Simple case: just add prefix
			$new_label = $prefix . $original_label;

			// If too long, slice the original label
			if ( strlen( $new_label ) > $max_length ) {
				$available_length = $max_length - strlen( $prefix );
				$new_label = $prefix . substr( $original_label, 0, $available_length );
			}

			// Check if this label already exists, if so, add a number
			$counter = 1;
			$base_label = $new_label;

			while ( in_array( $new_label, $existing_labels, true ) ) {
				$new_label = $prefix . substr( $original_label, 0, $available_length ) . $counter;

				// If too long, slice more from the base
				$new_label_length = strlen( $new_label );
				if ( $new_label_length > $max_length ) {
					$available_length = $max_length - strlen( $prefix . $counter );
					$new_label = $prefix . substr( $original_label, 0, $available_length ) . $counter;
				}

				++$counter;
			}
		}

		return $new_label;
	}
}
