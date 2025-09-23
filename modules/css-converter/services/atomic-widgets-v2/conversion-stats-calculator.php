<?php
namespace Elementor\Modules\CssConverter\Services\AtomicWidgetsV2;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Conversion_Stats_Calculator {

	public function calculate_conversion_stats( array $widget_data_array, array $widgets ): array {
		return [
			'total_elements_parsed' => $this->count_elements_recursively( $widget_data_array ),
			'total_widgets_created' => $this->count_widgets_recursively( $widgets ),
			'widget_types_created' => $this->get_widget_type_counts( $widgets ),
			'supported_elements' => $this->count_supported_elements( $widget_data_array ),
			'unsupported_elements' => $this->count_unsupported_elements( $widget_data_array ),
			'atomic_props_converted' => $this->count_atomic_props( $widget_data_array ),
			'styles_created' => $this->count_styles_created( $widgets ),
			'conversion_success_rate' => $this->calculate_success_rate( $widget_data_array, $widgets ),
		];
	}

	public function get_empty_stats(): array {
		return [
			'total_elements_parsed' => 0,
			'total_widgets_created' => 0,
			'widget_types_created' => [],
			'supported_elements' => 0,
			'unsupported_elements' => 0,
			'atomic_props_converted' => 0,
			'styles_created' => 0,
			'conversion_success_rate' => 0.0,
		];
	}

	private function count_elements_recursively( array $elements ): int {
		$count = count( $elements );

		foreach ( $elements as $element ) {
			if ( ! empty( $element['children'] ) ) {
				$count += $this->count_elements_recursively( $element['children'] );
			}
		}

		return $count;
	}

	private function count_widgets_recursively( array $widgets ): int {
		$count = count( $widgets );

		foreach ( $widgets as $widget ) {
			if ( ! empty( $widget['elements'] ) ) {
				$count += $this->count_widgets_recursively( $widget['elements'] );
			}
		}

		return $count;
	}

	private function get_widget_type_counts( array $widgets ): array {
		$counts = [];

		foreach ( $widgets as $widget ) {
			$widget_type = $widget['widgetType'] ?? $widget['elType'] ?? 'unknown';
			$counts[ $widget_type ] = ( $counts[ $widget_type ] ?? 0 ) + 1;

			if ( ! empty( $widget['elements'] ) ) {
				$child_counts = $this->get_widget_type_counts( $widget['elements'] );

				foreach ( $child_counts as $type => $count ) {
					$counts[ $type ] = ( $counts[ $type ] ?? 0 ) + $count;
				}
			}
		}

		return $counts;
	}

	private function count_supported_elements( array $elements ): int {
		$count = 0;

		foreach ( $elements as $element ) {
			if ( ! empty( $element['widget_type'] ) ) {
				$count++;
			}

			if ( ! empty( $element['children'] ) ) {
				$count += $this->count_supported_elements( $element['children'] );
			}
		}

		return $count;
	}

	private function count_unsupported_elements( array $elements ): int {
		$count = 0;

		foreach ( $elements as $element ) {
			if ( empty( $element['widget_type'] ) ) {
				$count++;
			}

			if ( ! empty( $element['children'] ) ) {
				$count += $this->count_unsupported_elements( $element['children'] );
			}
		}

		return $count;
	}

	private function count_atomic_props( array $elements ): int {
		$count = 0;

		foreach ( $elements as $element ) {
			if ( ! empty( $element['atomic_props'] ) ) {
				$count += count( $element['atomic_props'] );
			}

			if ( ! empty( $element['children'] ) ) {
				$count += $this->count_atomic_props( $element['children'] );
			}
		}

		return $count;
	}

	private function count_styles_created( array $widgets ): int {
		$count = 0;

		foreach ( $widgets as $widget ) {
			if ( ! empty( $widget['styles'] ) ) {
				$count += count( $widget['styles'] );
			}

			if ( ! empty( $widget['elements'] ) ) {
				$count += $this->count_styles_created( $widget['elements'] );
			}
		}

		return $count;
	}

	private function calculate_success_rate( array $widget_data_array, array $widgets ): float {
		$total_elements = $this->count_elements_recursively( $widget_data_array );
		$total_widgets = $this->count_widgets_recursively( $widgets );

		if ( $total_elements === 0 ) {
			return 0.0;
		}

		return round( ( $total_widgets / $total_elements ) * 100, 2 );
	}

	public function generate_detailed_stats( array $widget_data_array, array $widgets ): array {
		$basic_stats = $this->calculate_conversion_stats( $widget_data_array, $widgets );

		return array_merge( $basic_stats, [
			'css_properties_by_type' => $this->analyze_css_properties( $widget_data_array ),
			'widget_complexity_analysis' => $this->analyze_widget_complexity( $widgets ),
			'nesting_depth_analysis' => $this->analyze_nesting_depth( $widgets ),
			'performance_metrics' => $this->calculate_performance_metrics( $widget_data_array, $widgets ),
		]);
	}

	private function analyze_css_properties( array $elements ): array {
		$property_counts = [];

		foreach ( $elements as $element ) {
			if ( ! empty( $element['atomic_props'] ) ) {
				foreach ( $element['atomic_props'] as $property => $prop_data ) {
					$type = $prop_data['$$type'] ?? 'unknown';
					$property_counts[ $type ] = ( $property_counts[ $type ] ?? 0 ) + 1;
				}
			}

			if ( ! empty( $element['children'] ) ) {
				$child_counts = $this->analyze_css_properties( $element['children'] );
				foreach ( $child_counts as $type => $count ) {
					$property_counts[ $type ] = ( $property_counts[ $type ] ?? 0 ) + $count;
				}
			}
		}

		return $property_counts;
	}

	private function analyze_widget_complexity( array $widgets ): array {
		$complexity_stats = [
			'simple_widgets' => 0,    // 0-2 props
			'medium_widgets' => 0,    // 3-5 props
			'complex_widgets' => 0,   // 6+ props
		];

		foreach ( $widgets as $widget ) {
			$prop_count = 0;
			
			if ( ! empty( $widget['styles'] ) ) {
				foreach ( $widget['styles'] as $style ) {
					if ( ! empty( $style['variants'] ) ) {
						foreach ( $style['variants'] as $variant ) {
							$prop_count += count( $variant['props'] ?? [] );
						}
					}
				}
			}

			if ( $prop_count <= 2 ) {
				$complexity_stats['simple_widgets']++;
			} elseif ( $prop_count <= 5 ) {
				$complexity_stats['medium_widgets']++;
			} else {
				$complexity_stats['complex_widgets']++;
			}

			if ( ! empty( $widget['elements'] ) ) {
				$child_stats = $this->analyze_widget_complexity( $widget['elements'] );
				$complexity_stats['simple_widgets'] += $child_stats['simple_widgets'];
				$complexity_stats['medium_widgets'] += $child_stats['medium_widgets'];
				$complexity_stats['complex_widgets'] += $child_stats['complex_widgets'];
			}
		}

		return $complexity_stats;
	}

	private function analyze_nesting_depth( array $widgets, int $current_depth = 0 ): array {
		$max_depth = $current_depth;
		$depth_distribution = [];

		foreach ( $widgets as $widget ) {
			$depth_distribution[ $current_depth ] = ( $depth_distribution[ $current_depth ] ?? 0 ) + 1;

			if ( ! empty( $widget['elements'] ) ) {
				$child_analysis = $this->analyze_nesting_depth( $widget['elements'], $current_depth + 1 );
				$max_depth = max( $max_depth, $child_analysis['max_depth'] );
				
				foreach ( $child_analysis['depth_distribution'] as $depth => $count ) {
					$depth_distribution[ $depth ] = ( $depth_distribution[ $depth ] ?? 0 ) + $count;
				}
			}
		}

		return [
			'max_depth' => $max_depth,
			'depth_distribution' => $depth_distribution,
		];
	}

	private function calculate_performance_metrics( array $widget_data_array, array $widgets ): array {
		$total_elements = $this->count_elements_recursively( $widget_data_array );
		$total_widgets = $this->count_widgets_recursively( $widgets );
		$total_props = $this->count_atomic_props( $widget_data_array );

		return [
			'elements_per_widget_ratio' => $total_widgets > 0 ? round( $total_elements / $total_widgets, 2 ) : 0,
			'props_per_widget_ratio' => $total_widgets > 0 ? round( $total_props / $total_widgets, 2 ) : 0,
			'conversion_efficiency' => $total_elements > 0 ? round( ( $total_widgets / $total_elements ) * 100, 2 ) : 0,
		];
	}
}
