<?php

namespace Elementor\Modules\CssConverter\Services\Variables;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Variables_Registration_Service {

	const SOURCE_CSS_CONVERTER = 'css-converter';
	const DEFAULT_UPDATE_MODE = 'create_new';

	private $update_mode;

	public function __construct( $update_mode = self::DEFAULT_UPDATE_MODE ) {
		$this->update_mode = $update_mode;
	}

	public function get_update_mode(): string {
		return $this->update_mode;
	}

	public function register_with_elementor( array $converted_variables ): array {
		if ( ! $this->is_variables_available() ) {
			return [
				'registered' => 0,
				'skipped' => count( $converted_variables ),
				'error' => 'Variables Module not available',
			];
		}

		$repository = $this->get_variables_repository();

		if ( ! $repository ) {
			return [
				'registered' => 0,
				'skipped' => count( $converted_variables ),
				'error' => 'Variables Repository not accessible',
			];
		}

		$items = $repository->variables();
		$existing_names = $this->extract_existing_names( $items );
		$non_deleted_count = $this->count_non_deleted_variables( $items );

		$result = $this->filter_new_variables_with_duplicate_detection( $converted_variables, $existing_names, $items );
		$new_variables = $result['new_variables'];
		$variable_name_mappings = $result['variable_name_mappings'];
		$reused_count = $result['reused_count'];

		if ( empty( $new_variables ) ) {
			return [
				'registered' => 0,
				'skipped' => count( $converted_variables ) - $reused_count,
				'reused' => $reused_count,
				'reason' => 'All variables already exist or no valid variables',
				'variable_name_mappings' => $variable_name_mappings,
				'update_mode' => $this->update_mode,
				'debug' => [
					'converted_count' => count( $converted_variables ),
					'existing_count' => count( $existing_names ),
					'non_deleted_count' => $non_deleted_count,
					'limit' => \Elementor\Modules\Variables\Storage\Repository::TOTAL_VARIABLES_COUNT,
					'available_slots' => \Elementor\Modules\Variables\Storage\Repository::TOTAL_VARIABLES_COUNT - $non_deleted_count,
				],
			];
		}

		$variables_after_limit = $this->apply_variables_limit( $new_variables, $non_deleted_count );
		
		if ( count( $variables_after_limit ) < count( $new_variables ) ) {
			$max_limit = \Elementor\Modules\Variables\Storage\Repository::TOTAL_VARIABLES_COUNT;
			error_log( "Variables Registration: Limited variables from " . count( $new_variables ) . " to " . count( $variables_after_limit ) . " (available slots: " . ( $max_limit - $non_deleted_count ) . ")" );
		}

		$registered = 0;
		$skipped = count( $converted_variables ) - count( $variables_after_limit );
		$errors = [];

		foreach ( $variables_after_limit as $variable_name => $variable_data ) {
			$variable_config = $this->create_variable_config( $variable_name, $variable_data );

			try {
				$repository->create( $variable_config );
				$registered++;
			} catch ( \Exception $e ) {
				$skipped++;
				$errors[] = "Failed to create variable '$variable_name': " . $e->getMessage();
				error_log( "Variables Registration Error: Failed to create variable '$variable_name' - " . $e->getMessage() );
			}
		}
		
		if ( $registered === 0 && ! empty( $variables_after_limit ) ) {
			error_log( "Variables Registration: No variables registered! Count: " . count( $variables_after_limit ) . ", Errors: " . count( $errors ) );
		}

		return [
			'registered' => $registered,
			'skipped' => $skipped,
			'reused' => $reused_count,
			'variable_name_mappings' => $variable_name_mappings,
			'update_mode' => $this->update_mode,
			'errors' => $errors,
			'debug' => [
				'converted_count' => count( $converted_variables ),
				'new_variables_count' => count( $new_variables ),
				'after_limit_count' => count( $variables_after_limit ),
				'existing_count' => count( $existing_names ),
				'non_deleted_count' => $non_deleted_count,
				'limit' => \Elementor\Modules\Variables\Storage\Repository::TOTAL_VARIABLES_COUNT,
				'available_slots' => \Elementor\Modules\Variables\Storage\Repository::TOTAL_VARIABLES_COUNT - $non_deleted_count,
			],
		];
	}

	private function is_variables_available(): bool {
		return class_exists( '\Elementor\Modules\Variables\Module' );
	}

	private function get_variables_repository() {
		if ( ! $this->is_variables_available() ) {
			return null;
		}

		try {
			// Create repository directly like the Variables module does
			return new \Elementor\Modules\Variables\Storage\Repository(
				\Elementor\Plugin::$instance->kits_manager->get_active_kit()
			);
		} catch ( \Exception $e ) {
			return null;
		}
	}

	private function extract_existing_names( array $items ): array {
		$names = [];
		foreach ( $items as $item_id => $item_data ) {
			if ( isset( $item_data['deleted'] ) && $item_data['deleted'] ) {
				continue;
			}
			if ( isset( $item_data['label'] ) ) {
				$names[] = $item_data['label'];
			}
		}
		return $names;
	}

	private function count_non_deleted_variables( array $items ): int {
		$count = 0;
		foreach ( $items as $item_id => $item_data ) {
			if ( ! isset( $item_data['deleted'] ) || ! $item_data['deleted'] ) {
				$count++;
			}
		}
		error_log( "Variables Registration: count_non_deleted_variables - total items: " . count( $items ) . ", non-deleted: $count" );
		return $count;
	}

	private function filter_new_variables_with_duplicate_detection( array $converted_variables, array $existing_names, array $existing_items ): array {
		$new_variables = [];
		$variable_name_mappings = []; // original_name => final_name
		$reused_count = 0;

		foreach ( $converted_variables as $variable_name => $variable_data ) {
			if ( empty( $variable_data['value'] ) ) {
				continue;
			}

			// Check for duplicate variable name
			if ( in_array( $variable_name, $existing_names, true ) ) {
				error_log( "Variables Registration: Duplicate detected: '$variable_name' exists in repository" );
				// Duplicate detected - handle it
				$final_variable_name = $this->handle_duplicate_variable( $variable_name, $variable_data, $existing_items );
				
				// If we get a new name (with suffix), add it
				if ( $final_variable_name && $final_variable_name !== $variable_name ) {
					$new_variables[ $final_variable_name ] = $variable_data;
					$variable_name_mappings[ $variable_name ] = $final_variable_name; // Track the mapping
				} elseif ( null === $final_variable_name ) {
					// Reuse existing variable - map to original name
					$variable_name_mappings[ $variable_name ] = $variable_name;
					$reused_count++;
				}
				// If we get null or same name, skip (reuse existing)
				continue;
			}

			// Not a duplicate, add as normal
			$new_variables[ $variable_name ] = $variable_data;
			$variable_name_mappings[ $variable_name ] = $variable_name; // No change in name
		}

		error_log( "Variables Registration: filter_new_variables - converted: " . count( $converted_variables ) . ", new: " . count( $new_variables ) . ", reused: $reused_count" );

		return [
			'new_variables' => $new_variables,
			'variable_name_mappings' => $variable_name_mappings,
			'reused_count' => $reused_count,
		];
	}

	private function handle_duplicate_variable( string $variable_name, array $variable_data, array $existing_items ): ?string {
		// Find the existing variable with the same name
		$existing_variable = $this->find_existing_variable_by_name( $variable_name, $existing_items );
		
		if ( ! $existing_variable ) {
			// Variable doesn't exist, this shouldn't happen but handle gracefully
			return $variable_name;
		}

		$existing_value = $this->extract_variable_value( $existing_variable );
		$new_value = $variable_data['value'];

		// Compare variable values
		if ( $this->are_values_identical( $existing_value, $new_value ) ) {
			// Values are identical - reuse existing variable
			error_log( "Variables Registration: Values identical for '$variable_name': existing='$existing_value', new='$new_value'" );
			return null;
		}

		error_log( "Variables Registration: Values different for '$variable_name': existing='$existing_value', new='$new_value', update_mode='{$this->update_mode}'" );

		// Handle different update modes
		if ( 'update' === $this->update_mode ) {
			// Legacy mode: update existing variable in place
			error_log( "Variables Registration: Updating existing variable '$variable_name'" );
			$this->update_existing_variable( $existing_variable, $variable_data );
			return null; // Don't create new, updated existing
		}

		// Default mode: create new variable with suffix
		return $this->find_next_available_suffix( $variable_name, $existing_items );
	}

	private function find_existing_variable_by_name( string $variable_name, array $existing_items ) {
		foreach ( $existing_items as $item_id => $item_data ) {
			if ( isset( $item_data['label'] ) && $item_data['label'] === $variable_name ) {
				return $item_data;
			}
		}
		return null;
	}

	private function extract_variable_value( array $variable_config ) {
		// Extract value from the variable config structure
		if ( isset( $variable_config['value'] ) ) {
			return $variable_config['value'];
		}
		return '';
	}

	private function are_values_identical( $value1, $value2 ): bool {
		// Normalize both values for comparison
		$normalized1 = $this->normalize_variable_value( $value1 );
		$normalized2 = $this->normalize_variable_value( $value2 );
		
		return $normalized1 === $normalized2;
	}

	private function normalize_variable_value( $value ): string {
		if ( ! is_string( $value ) ) {
			$value = (string) $value;
		}

		// Basic normalization
		$value = trim( $value );
		$value = strtolower( $value );
		
		// Normalize whitespace
		$value = preg_replace( '/\s+/', ' ', $value );
		
		// Normalize colors (basic hex normalization)
		$value = preg_replace( '/#([0-9a-f]{3})\b/i', '#$1$1', $value ); // #abc -> #aabbcc
		
		return $value;
	}

	private function update_existing_variable( array $existing_variable, array $new_variable_data ): void {
		$repository = $this->get_variables_repository();
		if ( ! $repository ) {
			return;
		}

		// Find the variable ID from the existing variable data
		$variable_id = null;
		$items = $repository->variables();
		
		foreach ( $items as $item_id => $item_data ) {
			if ( $item_data === $existing_variable ) {
				$variable_id = $item_id;
				break;
			}
		}

		if ( ! $variable_id ) {
			error_log( "Variables Registration: Could not find variable ID for update" );
			return;
		}

		// Update the variable value in the repository
		try {
			$updated_data = array_merge( $existing_variable, [
				'value' => $new_variable_data['value'],
			] );
			
			$repository->update( $variable_id, $updated_data );
			error_log( "Variables Registration: Updated variable '$variable_id' with new value: " . $new_variable_data['value'] );
		} catch ( \Exception $e ) {
			error_log( "Variables Registration: Failed to update variable '$variable_id': " . $e->getMessage() );
		}
	}

	private function find_next_available_suffix( string $base_name, array $existing_items ): string {
		$suffix = 1; // Variables start with -1, not -2 like classes
		
		while ( $this->variable_name_exists( $base_name . '-' . $suffix, $existing_items ) ) {
			$suffix++;
		}
		
		return $base_name . '-' . $suffix;
	}

	private function variable_name_exists( string $variable_name, array $existing_items ): bool {
		foreach ( $existing_items as $item_data ) {
			if ( isset( $item_data['label'] ) && $item_data['label'] === $variable_name ) {
				return true;
			}
		}
		return false;
	}

	private function apply_variables_limit( array $new_variables, int $existing_count ): array {
		$max_limit = \Elementor\Modules\Variables\Storage\Repository::TOTAL_VARIABLES_COUNT;
		$available_slots = $max_limit - $existing_count;

		if ( $available_slots <= 0 ) {
			return [];
		}

		if ( count( $new_variables ) <= $available_slots ) {
			return $new_variables;
		}

		return array_slice( $new_variables, 0, $available_slots, true );
	}

	private function create_variable_config( string $variable_name, array $variable_data ): array {
		return [
			'label' => $variable_name,
			'type' => $variable_data['type'] ?? 'string',
			'value' => $variable_data['value'],
			'meta' => [
				'source' => self::SOURCE_CSS_CONVERTER,
				'imported_at' => time(),
			],
		];
	}
}
