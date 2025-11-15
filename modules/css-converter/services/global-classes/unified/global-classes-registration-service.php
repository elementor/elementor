<?php

namespace Elementor\Modules\CssConverter\Services\GlobalClasses\Unified;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Global_Classes_Registration_Service {

	const SOURCE_CSS_CONVERTER = 'css-converter';
	const MAX_CLASSES_LIMIT = 50;

	public function register_with_elementor( array $converted_classes ): array {
		if ( ! $this->is_global_classes_available() ) {
			return [
				'registered' => 0,
				'skipped' => count( $converted_classes ),
				'error' => 'Global Classes Module not available',
			];
		}

		$repository = $this->get_global_classes_repository();

		if ( ! $repository ) {
			return [
				'registered' => 0,
				'skipped' => count( $converted_classes ),
				'error' => 'Global Classes Repository not accessible',
			];
		}

		$existing = $repository->all();
		$items = $existing->get_items()->all();
		$order = $existing->get_order()->all();

		$existing_labels = $this->extract_existing_labels( $items );

		$debug_info = [
			'existing_labels_count' => count( $existing_labels ),
			'existing_labels' => array_slice( $existing_labels, 0, 10 ),
			'converting_classes' => array_keys( $converted_classes ),
			'total_items_count' => count( $items ),
		];

		$result = $this->filter_new_classes_with_duplicate_detection( $converted_classes, $existing_labels, $items );
		$new_classes = $result['new_classes'];
		$class_name_mappings = $result['class_name_mappings'];

		error_log( 'GLOBAL_CLASSES_REG: new_classes count: ' . count( $new_classes ) );
		error_log( 'GLOBAL_CLASSES_REG: class_name_mappings count: ' . count( $class_name_mappings ) );
		if ( isset( $class_name_mappings['brxw-intro-02'] ) ) {
			error_log( 'GLOBAL_CLASSES_REG: brxw-intro-02 mapped to: ' . $class_name_mappings['brxw-intro-02'] );
			$mapped_name = $class_name_mappings['brxw-intro-02'];
			error_log( 'GLOBAL_CLASSES_REG: brxw-intro-02-2 in new_classes: ' . ( isset( $new_classes[ $mapped_name ] ) ? 'YES' : 'NO' ) );
		}

		if ( empty( $new_classes ) ) {
			error_log( 'GLOBAL_CLASSES_REG: No new classes to register' );
			return [
				'registered' => 0,
				'skipped' => count( $converted_classes ),
				'reason' => 'All classes already exist or no valid classes',
				'class_name_mappings' => $class_name_mappings,
			];
		}

		error_log( 'GLOBAL_CLASSES_REG: Existing items count: ' . count( $items ) . ', MAX_LIMIT: ' . self::MAX_CLASSES_LIMIT );
		$limit_result = $this->apply_classes_limit( $new_classes, count( $items ) );
		$classes_after_limit = $limit_result['classes_for_global'];
		$overflow_styles_when_maximum_number_of_global_classes_has_been_reached = $limit_result['overflow_styles_when_maximum_number_of_global_classes_has_been_reached'];
		
		error_log( 'GLOBAL_CLASSES_REG: classes_after_limit count: ' . count( $classes_after_limit ) );
		error_log( 'GLOBAL_CLASSES_REG: overflow count: ' . count( $overflow_styles_when_maximum_number_of_global_classes_has_been_reached ) );
		if ( isset( $class_name_mappings['brxw-intro-02'] ) ) {
			$mapped_name = $class_name_mappings['brxw-intro-02'];
			error_log( 'GLOBAL_CLASSES_REG: brxw-intro-02-2 in classes_after_limit: ' . ( isset( $classes_after_limit[ $mapped_name ] ) ? 'YES' : 'NO' ) );
			error_log( 'GLOBAL_CLASSES_REG: brxw-intro-02-2 in overflow: ' . ( isset( $overflow_styles_when_maximum_number_of_global_classes_has_been_reached[ $mapped_name ] ) ? 'YES' : 'NO' ) );
		}

		$overflow_with_original_names = [];
		$overflow_mapped_classes = array_keys( $overflow_styles_when_maximum_number_of_global_classes_has_been_reached );
		foreach ( $class_name_mappings as $original => $mapped ) {
			if ( in_array( $mapped, $overflow_mapped_classes, true ) ) {
				error_log( 'GLOBAL_CLASSES_REG: Class in overflow: ' . $original . ' => ' . $mapped . ' (will apply as local widget styles)' );
				$overflow_with_original_names[ $original ] = $overflow_styles_when_maximum_number_of_global_classes_has_been_reached[ $mapped ];
				unset( $overflow_styles_when_maximum_number_of_global_classes_has_been_reached[ $mapped ] );
				unset( $class_name_mappings[ $original ] );
			}
		}
		$overflow_styles_when_maximum_number_of_global_classes_has_been_reached = array_merge(
			$overflow_styles_when_maximum_number_of_global_classes_has_been_reached,
			$overflow_with_original_names
		);

		// CRITICAL FIX: Remove classes that were successfully converted to global classes from overflow styles
		// This prevents duplication where a class gets both a global class AND a widget local class
		$successfully_converted_original_classes = array_keys( $class_name_mappings );
		$overflow_styles_when_maximum_number_of_global_classes_has_been_reached = $this->filter_out_successfully_converted_classes(
			$overflow_styles_when_maximum_number_of_global_classes_has_been_reached,
			$successfully_converted_original_classes
		);

		$registered = 0;
		$skipped = count( $converted_classes ) - count( $classes_after_limit );

		foreach ( $classes_after_limit as $class_name => $class_data ) {
			$custom_css = $class_data['custom_css'] ?? '';
			if ( strpos( $class_name, 'brxw-intro-02' ) !== false ) {
				error_log( 'GLOBAL_CLASSES_REG: Registering class ' . $class_name . ' with custom CSS: ' . substr( $custom_css, 0, 150 ) );
			}
			$class_config = $this->create_class_config( $class_name, $class_data['atomic_props'], $custom_css );

			$items[ $class_name ] = $class_config;
			$order[] = $class_name;
			++$registered;
		}

		try {
			// Debug: Log what we're about to save
			$new_class_labels = array_keys( $classes_after_limit );
			error_log( 'GLOBAL_CLASSES_REG: Saving ' . count( $items ) . ' classes to kit, ' . $registered . ' new' );
			error_log( 'GLOBAL_CLASSES_REG: New class labels: ' . implode( ', ', $new_class_labels ) );

			$repository->put( $items, $order );
			error_log( 'GLOBAL_CLASSES_REG: Successfully saved to repository' );

			// Debug: Verify data was saved by reading it back immediately
			$verify_repository = $this->get_global_classes_repository();
			$verify_existing = $verify_repository->all();
			$verify_items = $verify_existing->get_items()->all();
			$verify_labels = $this->extract_existing_labels( $verify_items );

			// Force clear of kit metadata cache to ensure subsequent API calls see updated data
			// The Elementor Kit caches metadata, and we need to invalidate this specific cache
			$kit_id = \Elementor\Plugin::$instance->kits_manager->get_active_kit()->get_id();
			if ( $kit_id ) {
				// Clear WordPress post meta cache for this kit
				wp_cache_delete( $kit_id, 'post_meta' );
				// Also try clearing the kit's internal cache
				clean_post_cache( $kit_id );
			}

			$debug_info['after_save_total_classes'] = count( $verify_labels );
			$debug_info['after_save_first_10'] = array_slice( $verify_labels, 0, 10 );
			$debug_info['new_classes_added'] = $new_class_labels;

			// Verify classes are actually in the repository
			$this->verify_classes_in_repository( $new_class_labels );

			return [
				'registered' => $registered,
				'skipped' => $skipped,
				'overflow_styles_when_maximum_number_of_global_classes_has_been_reached' => $overflow_styles_when_maximum_number_of_global_classes_has_been_reached,
				'total_classes' => count( $items ),
				'class_name_mappings' => $class_name_mappings,
				'debug_duplicate_detection' => $debug_info,
			];
		} catch ( \Exception $e ) {
			return [
				'registered' => 0,
				'skipped' => count( $converted_classes ),
				'overflow_styles_when_maximum_number_of_global_classes_has_been_reached' => [],
				'error' => 'Failed to save to repository: ' . $e->getMessage(),
				'class_name_mappings' => $class_name_mappings,
			];
		}
	}

	private function is_global_classes_available(): bool {
		return defined( 'ELEMENTOR_VERSION' ) &&
			class_exists( '\Elementor\Modules\GlobalClasses\Global_Classes_Repository' );
	}

	private function get_global_classes_repository() {
		if ( ! defined( 'ELEMENTOR_VERSION' ) ) {
			return null;
		}

		try {
			return \Elementor\Modules\GlobalClasses\Global_Classes_Repository::make()
				->context( \Elementor\Modules\GlobalClasses\Global_Classes_Repository::CONTEXT_PREVIEW );
		} catch ( \Exception $e ) {
			return null;
		}
	}

	private function extract_existing_labels( array $items ): array {
		$labels = [];

		foreach ( $items as $item ) {
			if ( isset( $item['label'] ) ) {
				$labels[] = $item['label'];
			}
		}

		return $labels;
	}

	private function filter_new_classes_with_duplicate_detection( array $converted_classes, array $existing_labels, array $existing_items ): array {
		$new_classes = [];
		$class_name_mappings = []; // original_name => final_name

		foreach ( $converted_classes as $class_name => $class_data ) {
			if ( empty( $class_data['atomic_props'] ) ) {
				continue;
			}

			// Check for duplicate class name
			if ( in_array( $class_name, $existing_labels, true ) ) {
				// Duplicate detected - handle it
				$final_class_name = $this->handle_duplicate_class( $class_name, $class_data, $existing_items );

				// If we get a new name (with suffix), add it
				if ( $final_class_name && $final_class_name !== $class_name ) {
					$new_classes[ $final_class_name ] = $class_data;
					$class_name_mappings[ $class_name ] = $final_class_name; // Track the mapping
				} elseif ( null === $final_class_name ) {
					// Reuse existing class - map to original name
					$class_name_mappings[ $class_name ] = $class_name;
				}
				// If we get null or same name, skip (reuse existing)
				continue;
			}

			// Not a duplicate, add as normal
			$new_classes[ $class_name ] = $class_data;
			$class_name_mappings[ $class_name ] = $class_name; // No change in name
		}

		return [
			'new_classes' => $new_classes,
			'class_name_mappings' => $class_name_mappings,
		];
	}

	private function handle_duplicate_class( string $class_name, array $class_data, array $existing_items ): ?string {
		// Find the existing class with the same name
		if ( ! isset( $existing_items[ $class_name ] ) ) {
			// Class doesn't exist, this shouldn't happen but handle gracefully
			return $class_name;
		}

		$existing_class = $existing_items[ $class_name ];
		$existing_atomic_props = $this->extract_atomic_props( $existing_class );
		$new_atomic_props = $class_data['atomic_props'];

		// Compare atomic properties
		$are_identical = $this->are_styles_identical( $existing_atomic_props, $new_atomic_props );
		if ( $are_identical ) {
			// Styles are identical - reuse existing class
			return null;
		}

		// Styles are different - create new class with suffix
		$new_suffix = $this->find_next_available_suffix( $class_name, $existing_items );
		return $new_suffix;
	}

	private function extract_atomic_props( array $class_config ): array {
		// Extract atomic props from the class config structure
		if ( isset( $class_config['variants'][0]['props'] ) ) {
			return $class_config['variants'][0]['props'];
		}
		return [];
	}

	private function are_styles_identical( array $props1, array $props2 ): bool {
		// Sort both arrays recursively for consistent comparison
		$this->sort_array_recursively( $props1 );
		$this->sort_array_recursively( $props2 );

		// Convert both arrays to JSON strings for deep comparison
		$json1 = wp_json_encode( $props1 );
		$json2 = wp_json_encode( $props2 );

		$identical = $json1 === $json2;

		return $identical;
	}

	private function sort_array_recursively( array &$array ): void {
		ksort( $array );
		foreach ( $array as &$value ) {
			if ( is_array( $value ) ) {
				$this->sort_array_recursively( $value );
			}
		}
	}

	private function find_next_available_suffix( string $base_name, array $existing_items ): string {
		$suffix = 2;

		while ( isset( $existing_items[ $base_name . '-' . $suffix ] ) ) {
			++$suffix;
		}

		return $base_name . '-' . $suffix;
	}

	/**
	 * Filter out classes that were successfully converted to global classes from overflow styles
	 * This prevents duplication where a class gets both a global class AND a widget local class
	 *
	 * @param array $overflow_styles Classes that exceeded the global limit
	 * @param array $successfully_converted_classes Original class names that were successfully converted
	 * @return array Filtered overflow styles excluding successfully converted classes
	 */
	private function filter_out_successfully_converted_classes( array $overflow_styles, array $successfully_converted_classes ): array {
		$filtered_overflow = [];

		foreach ( $overflow_styles as $class_name => $class_data ) {
			// Only include in overflow if the original class was NOT successfully converted to a global class
			if ( ! in_array( $class_name, $successfully_converted_classes, true ) ) {
				$filtered_overflow[ $class_name ] = $class_data;
			} else {
			}
		}

		return $filtered_overflow;
	}

	private function apply_classes_limit( array $new_classes, int $existing_count ): array {
		$available_slots = self::MAX_CLASSES_LIMIT - $existing_count;

		if ( $available_slots <= 0 ) {
			return [
				'classes_for_global' => [],
				'overflow_styles_when_maximum_number_of_global_classes_has_been_reached' => $new_classes,
			];
		}

		if ( count( $new_classes ) <= $available_slots ) {
			return [
				'classes_for_global' => $new_classes,
				'overflow_styles_when_maximum_number_of_global_classes_has_been_reached' => [],
			];
		}

		$classes_for_global = array_slice( $new_classes, 0, $available_slots, true );
		$overflow_styles_when_maximum_number_of_global_classes_has_been_reached = array_slice( $new_classes, $available_slots, null, true );


		return [
			'classes_for_global' => $classes_for_global,
			'overflow_styles_when_maximum_number_of_global_classes_has_been_reached' => $overflow_styles_when_maximum_number_of_global_classes_has_been_reached,
		];
	}

	private function create_class_config( string $class_name, array $atomic_props, string $custom_css = '' ): array {
		$config = [
			'id' => $this->generate_class_id( $class_name ),
			'label' => $class_name,
			'type' => 'class',
			'variants' => [
				[
					'meta' => [
						'breakpoint' => 'desktop',
						'state' => null,
					],
					'props' => $atomic_props,
				],
			],
			'meta' => [
				'source' => self::SOURCE_CSS_CONVERTER,
				'imported_at' => time(),
			],
		];

		if ( ! empty( $custom_css ) ) {
			$config['variants'][0]['custom_css'] = [
				'raw' => \Elementor\Utils::encode_string( $custom_css ),
			];
			if ( strpos( $class_name, 'brxw-intro-02' ) !== false ) {
				error_log( 'GLOBAL_CLASSES_REG: create_class_config - Added custom CSS for ' . $class_name . ' in standard format: ' . substr( $custom_css, 0, 150 ) );
			}
		}

		return $config;
	}

	private function generate_class_id( string $class_name ): string {
		$sanitized = sanitize_key( $class_name );

		// FIX: Remove css- prefix to match original class names
		// This ensures HTML class="single-class" matches global class ID "single-class"
		return $sanitized;
	}

	public function check_duplicate_classes( array $converted_classes ): array {
		if ( ! $this->is_global_classes_available() ) {
			return [
				'duplicates' => [],
				'new_classes' => array_keys( $converted_classes ),
				'error' => 'Global Classes Module not available',
			];
		}

		$repository = $this->get_global_classes_repository();

		if ( ! $repository ) {
			return [
				'duplicates' => [],
				'new_classes' => array_keys( $converted_classes ),
				'error' => 'Repository not accessible',
			];
		}

		$existing = $repository->all();
		$existing_labels = $this->extract_existing_labels( $existing->get_items()->all() );

		$duplicates = [];
		$new_classes = [];

		foreach ( $converted_classes as $class_name => $class_data ) {
			if ( in_array( $class_name, $existing_labels, true ) ) {
				$duplicates[] = $class_name;
			} else {
				$new_classes[] = $class_name;
			}
		}

		return [
			'duplicates' => $duplicates,
			'new_classes' => $new_classes,
			'total_existing' => count( $existing_labels ),
		];
	}

	public function get_repository_stats(): array {
		if ( ! $this->is_global_classes_available() ) {
			return [
				'available' => false,
				'error' => 'Global Classes Module not available',
			];
		}

		$repository = $this->get_global_classes_repository();

		if ( ! $repository ) {
			return [
				'available' => false,
				'error' => 'Repository not accessible',
			];
		}

		try {
			$existing = $repository->all();
			$items = $existing->get_items()->all();

			return [
				'available' => true,
				'total_classes' => count( $items ),
				'available_slots' => self::MAX_CLASSES_LIMIT - count( $items ),
				'max_limit' => self::MAX_CLASSES_LIMIT,
			];
		} catch ( \Exception $e ) {
			return [
				'available' => false,
				'error' => 'Failed to get stats: ' . $e->getMessage(),
			];
		}
	}

	private function verify_classes_in_repository( array $class_names ): void {
		try {
			$repository = $this->get_global_classes_repository();
			if ( ! $repository ) {
				return;
			}

			$existing = $repository->all();
			$items = $existing->get_items()->all();

			foreach ( $class_names as $class_name ) {
				$found = false;
				foreach ( $items as $item_id => $item ) {
					if ( isset( $item['label'] ) && $item['label'] === $class_name ) {
						$found = true;
						break;
					}
				}
			}
		} catch ( \Exception $e ) {
			// Silent error handling
		}
	}
}
