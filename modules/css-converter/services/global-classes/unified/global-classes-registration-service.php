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

		$new_classes = $this->filter_new_classes( $converted_classes, $existing_labels );

		if ( empty( $new_classes ) ) {
			return [
				'registered' => 0,
				'skipped' => count( $converted_classes ),
				'reason' => 'All classes already exist or no valid classes',
			];
		}

		$classes_after_limit = $this->apply_classes_limit( $new_classes, count( $items ) );

		$registered = 0;
		$skipped = count( $converted_classes ) - count( $classes_after_limit );

		foreach ( $classes_after_limit as $class_name => $class_data ) {
			$class_config = $this->create_class_config( $class_name, $class_data['atomic_props'] );

			$items[ $class_name ] = $class_config;
			$order[] = $class_name;
			++$registered;
		}

		try {
			$repository->put( $items, $order );

			return [
				'registered' => $registered,
				'skipped' => $skipped,
				'total_classes' => count( $items ),
			];
		} catch ( \Exception $e ) {
			return [
				'registered' => 0,
				'skipped' => count( $converted_classes ),
				'error' => 'Failed to save to repository: ' . $e->getMessage(),
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
				->context( \Elementor\Modules\GlobalClasses\Global_Classes_Repository::CONTEXT_FRONTEND );
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

	private function filter_new_classes( array $converted_classes, array $existing_labels ): array {
		$new_classes = [];

		foreach ( $converted_classes as $class_name => $class_data ) {
			if ( in_array( $class_name, $existing_labels, true ) ) {
				continue;
			}

			if ( empty( $class_data['atomic_props'] ) ) {
				continue;
			}

			$new_classes[ $class_name ] = $class_data;
		}

		return $new_classes;
	}

	private function apply_classes_limit( array $new_classes, int $existing_count ): array {
		$available_slots = self::MAX_CLASSES_LIMIT - $existing_count;

		if ( $available_slots <= 0 ) {
			return [];
		}

		if ( count( $new_classes ) <= $available_slots ) {
			return $new_classes;
		}

		return array_slice( $new_classes, 0, $available_slots, true );
	}

	private function create_class_config( string $class_name, array $atomic_props ): array {
		return [
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
}
