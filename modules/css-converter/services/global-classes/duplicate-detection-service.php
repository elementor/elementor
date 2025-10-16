<?php
namespace Elementor\Modules\CssConverter\Services\GlobalClasses;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Elementor\Modules\GlobalClasses\Global_Classes_Repository;

class Duplicate_Detection_Service {
	private $comparison_service;
	private $performance_logger;

	public function __construct( $comparison_service = null ) {
		$this->comparison_service = $comparison_service ? $comparison_service : new Class_Comparison_Service();
		$this->performance_logger = new Performance_Logger();
	}

	public function find_or_create_class( array $new_class, array $existing_classes_cache = null ): array {
		$start_time = microtime( true );

		$base_label = $this->extract_base_label( $new_class['label'] );
		
		$existing_classes = null !== $existing_classes_cache
			? $existing_classes_cache
			: $this->get_existing_classes_from_repository();
		

		$variants = $this->get_all_label_variants( $base_label, $existing_classes );
		

		$match = $this->find_matching_variant( $new_class, $variants );
		
		if ( $match ) {
			$elapsed = microtime( true ) - $start_time;
			$this->performance_logger->log_comparison( 'reused', $elapsed, count( $variants ) );

			return [
				'action' => 'reused',
				'class_id' => $match['id'],
				'class_label' => $match['label'],
				'original_label' => $new_class['label'],
			];
		}

		$next_suffix = $this->find_next_available_suffix( $base_label, $variants );
		$new_label = $this->apply_suffix( $base_label, $next_suffix );
		$new_class['label'] = $new_label;

		$elapsed = microtime( true ) - $start_time;
		$this->performance_logger->log_comparison( 'created', $elapsed, count( $variants ) );

		return [
			'action' => 'created',
			'class_data' => $new_class,
			'original_label' => $base_label,
			'applied_suffix' => $next_suffix,
		];
	}

	private function extract_base_label( string $label ): string {
		if ( 1 === preg_match( '/^(.+)-(\d+)$/', $label, $matches ) ) {
			return $matches[1];
		}
		return $label;
	}

	private function get_existing_classes_from_repository(): array {
		try {
			$repository = Global_Classes_Repository::make();
			$classes = $repository->all();
			return $classes->get_items()->all();
		} catch ( \Exception $e ) {
			return [];
		}
	}

	private function get_all_label_variants( string $base_label, array $existing_classes ): array {
		$variants = [];
		$base_label_lower = strtolower( $base_label );

		foreach ( $existing_classes as $class_id => $class_data ) {
			$class_label = $class_data['label'] ?? '';
			$class_base = $this->extract_base_label( $class_label );

			if ( strtolower( $class_base ) === $base_label_lower ) {
				$variants[] = $class_data;
			}
		}

		return $variants;
	}

	private function find_matching_variant( array $new_class, array $variants ): ?array {
		foreach ( $variants as $variant ) {
			if ( $this->comparison_service->are_classes_identical( $new_class, $variant ) ) {
				return $variant;
			}
		}
		return null;
	}

	private function find_next_available_suffix( string $base_label, array $variants ): int {
		if ( empty( $variants ) ) {
			return 0;
		}

		$max_suffix = 0;
		$has_base_label = false;

		foreach ( $variants as $variant ) {
			$label = $variant['label'] ?? '';

			if ( $label === $base_label ) {
				$has_base_label = true;
				continue;
			}

			if ( 1 === preg_match( '/^' . preg_quote( $base_label, '/' ) . '-(\d+)$/', $label, $matches ) ) {
				$suffix = (int) $matches[1];
				if ( $suffix > $max_suffix ) {
					$max_suffix = $suffix;
				}
			}
		}

		if ( ! $has_base_label && 0 === $max_suffix ) {
			return 0;
		}

		return $max_suffix + 1;
	}

	private function apply_suffix( string $base_label, int $suffix ): string {
		if ( 0 === $suffix ) {
			return $base_label;
		}
		return $base_label . '-' . $suffix;
	}

	public function get_performance_stats(): array {
		return $this->performance_logger->get_stats();
	}
}
