<?php

namespace Elementor\Modules\CssConverter\Services\Widgets;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Widget_Class_Extractor {

	public function extract_all_classes_from_widgets( array $widgets ): array {
		$all_classes = [];

		foreach ( $widgets as $widget ) {
			$widget_classes = $this->extract_classes_from_widget( $widget );
			$all_classes = array_merge( $all_classes, $widget_classes );

			if ( ! empty( $widget['children'] ) ) {
				$child_classes = $this->extract_all_classes_from_widgets( $widget['children'] );
				$all_classes = array_merge( $all_classes, $child_classes );
			}
		}

		return array_values( array_unique( array_filter( $all_classes ) ) );
	}

	public function get_class_usage_statistics( array $widgets ): array {
		$class_usage = [];

		$this->count_class_usage_recursive( $widgets, $class_usage );

		arsort( $class_usage );

		return $class_usage;
	}

	public function prioritize_classes_by_usage( array $classes, array $widgets ): array {
		$usage_stats = $this->get_class_usage_statistics( $widgets );
		$prioritized = [];

		foreach ( $usage_stats as $class_name => $usage_count ) {
			if ( isset( $classes[ $class_name ] ) ) {
				$prioritized[ $class_name ] = $classes[ $class_name ];
			}
		}

		foreach ( $classes as $class_name => $class_data ) {
			if ( ! isset( $prioritized[ $class_name ] ) ) {
				$prioritized[ $class_name ] = $class_data;
			}
		}

		return $prioritized;
	}

	private function extract_classes_from_widget( array $widget ): array {
		$class_string = $widget['attributes']['class'] ?? '';

		if ( empty( $class_string ) ) {
			return [];
		}

		return array_filter(
			array_map( 'trim', explode( ' ', $class_string ) ),
			function( $class ) {
				return ! empty( $class );
			}
		);
	}

	private function count_class_usage_recursive( array $widgets, array &$class_usage ): void {
		foreach ( $widgets as $widget ) {
			$widget_classes = $this->extract_classes_from_widget( $widget );

			foreach ( $widget_classes as $class_name ) {
				if ( ! isset( $class_usage[ $class_name ] ) ) {
					$class_usage[ $class_name ] = 0;
				}
				++$class_usage[ $class_name ];
			}

			if ( ! empty( $widget['children'] ) ) {
				$this->count_class_usage_recursive( $widget['children'], $class_usage );
			}
		}
	}
}






