<?php
namespace Elementor\Modules\CssConverter\Services\Variables;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Nested_Variable_Extractor {

	private $value_normalizer;
	private $variable_renamer;

	public function __construct(
		CSS_Value_Normalizer $value_normalizer = null,
		Nested_Variable_Renamer $variable_renamer = null
	) {
		$this->value_normalizer = $value_normalizer ?? new CSS_Value_Normalizer();
		$this->variable_renamer = $variable_renamer ?? new Nested_Variable_Renamer();
	}

	public function extract_and_rename( array $raw_variables ): array {
		$root_variables = $this->separate_root_variables( $raw_variables );
		$nested_variables = $this->separate_nested_variables( $raw_variables );

		$all_variables = $root_variables;
		$variable_mapping = [];
		$scope_references = [];

		foreach ( $root_variables as $var_name => $var_data ) {
			$scope_key = $var_data['scope'] . ' ' . $var_name;
			$variable_mapping[ $scope_key ] = $var_name;

			if ( ! isset( $scope_references[ $var_name ] ) ) {
				$scope_references[ $var_name ] = [];
			}
			$scope_references[ $var_name ][] = $var_data['scope'];
		}

		foreach ( $nested_variables as $var_name => $scoped_values ) {
			$this->process_nested_variable(
				$var_name,
				$scoped_values,
				$all_variables,
				$variable_mapping,
				$scope_references
			);
		}

		return [
			'variables' => $all_variables,
			'variable_mapping' => $variable_mapping,
			'scope_references' => $scope_references,
			'stats' => [
				'total_variables' => count( $all_variables ),
				'root_variables' => count( $root_variables ),
				'nested_variables' => count( $nested_variables ),
			],
		];
	}

	private function separate_root_variables( array $raw_variables ): array {
		$root_vars = [];

		foreach ( $raw_variables as $var_name => $var_data ) {
			$scope = $var_data['scope'] ?? '';
			$actual_name = $var_data['name'] ?? '';

			if ( $this->is_root_scope( $scope ) && ! $this->is_media_query_scope( $scope ) ) {
				$root_vars[ $actual_name ] = [
					'name' => $actual_name,
					'value' => $var_data['value'] ?? '',
					'scope' => $scope,
					'original_block' => $var_data['original_block'] ?? '',
				];
			}
		}

		return $root_vars;
	}

	private function separate_nested_variables( array $raw_variables ): array {
		$nested = [];

		foreach ( $raw_variables as $var_name => $var_data ) {
			$scope = $var_data['scope'] ?? '';
			$actual_name = $var_data['name'] ?? '';

			if ( $this->is_root_scope( $scope ) && $this->is_media_query_scope( $scope ) ) {
				if ( ! isset( $nested[ $actual_name ] ) ) {
					$nested[ $actual_name ] = [];
				}

				$normalized_value = $this->value_normalizer->normalize( $var_data['value'] ?? '' );
				$nested[ $actual_name ][ $scope ] = [
					'scope' => $scope,
					'value' => $var_data['value'] ?? '',
					'normalized_value' => $normalized_value,
					'original_block' => $var_data['original_block'] ?? '',
				];
			} elseif ( ! $this->is_root_scope( $scope ) ) {
				if ( ! isset( $nested[ $actual_name ] ) ) {
					$nested[ $actual_name ] = [];
				}

				$normalized_value = $this->value_normalizer->normalize( $var_data['value'] ?? '' );
				$nested[ $actual_name ][ $scope ] = [
					'scope' => $scope,
					'value' => $var_data['value'] ?? '',
					'normalized_value' => $normalized_value,
					'original_block' => $var_data['original_block'] ?? '',
				];
			}
		}

		return $nested;
	}

	private function process_nested_variable(
		string $var_name,
		array $scoped_values,
		array &$all_variables,
		array &$variable_mapping,
		array &$scope_references
	): void {
		$root_value = $all_variables[ $var_name ] ?? null;
		$root_normalized = null;

		if ( $root_value ) {
			$root_normalized = $this->value_normalizer->normalize( $root_value['value'] );
		}

		$unique_values = [];
		$scope_to_variable_name = [];

		foreach ( $scoped_values as $scope => $var_data ) {
			$normalized = $var_data['normalized_value'];

			if ( $root_value && $normalized === $root_normalized ) {
				$scope_to_variable_name[ $scope ] = $var_name;
				continue;
			}

			$found = false;
			foreach ( $unique_values as $unique_var_name => $unique_normalized ) {
				if ( $unique_normalized === $normalized ) {
					$scope_to_variable_name[ $scope ] = $unique_var_name;
					$found = true;
					break;
				}
			}

			if ( ! $found ) {
				$next_suffix = $this->variable_renamer->find_next_suffix( $var_name, $all_variables );
				$new_var_name = $this->variable_renamer->apply_suffix( $var_name, $next_suffix );

				if ( ! isset( $all_variables[ $new_var_name ] ) ) {
					$all_variables[ $new_var_name ] = [
						'name' => $new_var_name,
						'value' => $var_data['value'],
						'scope' => $scope,
						'original_block' => $var_data['original_block'],
					];
				}

				$unique_values[ $new_var_name ] = $normalized;
				$scope_to_variable_name[ $scope ] = $new_var_name;

				if ( ! isset( $scope_references[ $new_var_name ] ) ) {
					$scope_references[ $new_var_name ] = [];
				}
				$scope_references[ $new_var_name ][] = $scope;
			}
		}

		foreach ( $scope_to_variable_name as $scope => $final_var_name ) {
			$scope_key = $scope . ' ' . $var_name;
			$variable_mapping[ $scope_key ] = $final_var_name;
		}
	}

	private function is_root_scope( string $scope ): bool {
		$trimmed = trim( $scope );
		$base_scope = preg_replace( '/@media\s*\([^)]*\)\s*/', '', $trimmed );
		$base_scope = preg_replace( '/@supports\s*\([^)]*\)\s*/', '', $base_scope );
		$base_scope = trim( $base_scope );

		return ':root' === $base_scope || 'html' === $base_scope;
	}

	private function is_media_query_scope( string $scope ): bool {
		return false !== strpos( $scope, '@media' );
	}
}
