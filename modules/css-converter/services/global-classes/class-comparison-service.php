<?php
namespace Elementor\Modules\CssConverter\Services\GlobalClasses;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Class_Comparison_Service {

	public function are_classes_identical( array $class_a, array $class_b ): bool {
		if ( ! $this->have_same_structure( $class_a, $class_b ) ) {
			return false;
		}

		$props_a = $class_a['variants'][0]['props'] ?? [];
		$props_b = $class_b['variants'][0]['props'] ?? [];

		return $this->are_properties_identical( $props_a, $props_b );
	}

	private function have_same_structure( array $class_a, array $class_b ): bool {
		if ( ! isset( $class_a['variants'][0] ) || ! isset( $class_b['variants'][0] ) ) {
			return false;
		}

		$meta_a = $class_a['variants'][0]['meta'] ?? [];
		$meta_b = $class_b['variants'][0]['meta'] ?? [];

		if ( ( $meta_a['breakpoint'] ?? 'desktop' ) !== ( $meta_b['breakpoint'] ?? 'desktop' ) ) {
			return false;
		}

		if ( ( $meta_a['state'] ?? null ) !== ( $meta_b['state'] ?? null ) ) {
			return false;
		}

		return true;
	}

	private function are_properties_identical( array $props_a, array $props_b ): bool {
		$normalized_a = $this->normalize_properties( $props_a );
		$normalized_b = $this->normalize_properties( $props_b );

		if ( count( $normalized_a ) !== count( $normalized_b ) ) {
			return false;
		}

		foreach ( $normalized_a as $key => $value_a ) {
			if ( ! isset( $normalized_b[ $key ] ) ) {
				return false;
			}

			if ( ! $this->are_atomic_values_identical( $value_a, $normalized_b[ $key ] ) ) {
				return false;
			}
		}

		return true;
	}

	private function normalize_properties( array $props ): array {
		ksort( $props );
		return $props;
	}

	private function are_atomic_values_identical( $value_a, $value_b ): bool {
		if ( gettype( $value_a ) !== gettype( $value_b ) ) {
			return false;
		}

		if ( is_array( $value_a ) ) {
			return $this->are_arrays_identical( $value_a, $value_b );
		}

		return $value_a === $value_b;
	}

	private function are_arrays_identical( array $arr_a, array $arr_b ): bool {
		if ( count( $arr_a ) !== count( $arr_b ) ) {
			return false;
		}

		ksort( $arr_a );
		ksort( $arr_b );

		foreach ( $arr_a as $key => $val_a ) {
			if ( ! array_key_exists( $key, $arr_b ) ) {
				return false;
			}

			if ( ! $this->are_atomic_values_identical( $val_a, $arr_b[ $key ] ) ) {
				return false;
			}
		}

		return true;
	}
}
