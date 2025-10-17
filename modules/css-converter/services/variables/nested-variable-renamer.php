<?php
namespace Elementor\Modules\CssConverter\Services\Variables;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Nested_Variable_Renamer {

	public function find_next_suffix( string $base_name, array $existing_variables ): int {
		$suffix = 1;

		while ( isset( $existing_variables[ $this->apply_suffix( $base_name, $suffix ) ] ) ) {
			++$suffix;
		}

		return $suffix;
	}

	public function apply_suffix( string $base_name, int $suffix ): string {
		if ( 0 === $suffix ) {
			return $base_name;
		}

		return $base_name . '-' . $suffix;
	}

	public function extract_suffix_number( string $variable_name, string $base_name ): ?int {
		$pattern = '/^' . preg_quote( $base_name, '/' ) . '-(\d+)$/';

		if ( 1 === preg_match( $pattern, $variable_name, $matches ) ) {
			return (int) $matches[1];
		}

		return null;
	}

	public function get_all_variants( string $base_name, array $existing_variables ): array {
		$variants = [];

		if ( isset( $existing_variables[ $base_name ] ) ) {
			$variants[ $base_name ] = $existing_variables[ $base_name ];
		}

		foreach ( $existing_variables as $var_name => $var_data ) {
			$suffix = $this->extract_suffix_number( $var_name, $base_name );

			if ( null !== $suffix ) {
				$variants[ $var_name ] = $var_data;
			}
		}

		return $variants;
	}

	public function is_suffixed_variant( string $variable_name, string $base_name ): bool {
		return null !== $this->extract_suffix_number( $variable_name, $base_name );
	}
}

