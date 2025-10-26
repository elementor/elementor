<?php
namespace Elementor\Modules\CssConverter\Services\Widgets;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Widget_Creation_Statistics_Collector {
	private array $creation_stats;

	public function __construct() {
		$this->initialize_creation_stats();
	}

	public function increment_widgets_created(): void {
		++$this->creation_stats['widgets_created'];
	}

	public function increment_widgets_failed(): void {
		++$this->creation_stats['widgets_failed'];
	}

	public function increment_global_classes_created(): void {
		++$this->creation_stats['global_classes_created'];
	}

	public function increment_variables_created(): void {
		++$this->creation_stats['variables_created'];
	}

	public function add_error( array $error ): void {
		$this->creation_stats['errors'][] = $error;
	}

	public function add_warning( array $warning ): void {
		$this->creation_stats['warnings'][] = $warning;
	}

	public function get_stats(): array {
		return $this->creation_stats;
	}

	public function merge_hierarchy_stats( array $hierarchy_stats ): void {
		$this->creation_stats['hierarchy_stats'] = $hierarchy_stats;
		$this->creation_stats['total_widgets_processed'] = $hierarchy_stats['total_widgets'] ?? 0;
		$this->creation_stats['parent_widgets'] = $hierarchy_stats['parent_widgets'] ?? 0;
		$this->creation_stats['child_widgets'] = $hierarchy_stats['child_widgets'] ?? 0;
		$this->creation_stats['hierarchy_depth'] = $hierarchy_stats['depth_levels'] ?? 0;
		$this->creation_stats['hierarchy_errors'] = $hierarchy_stats['hierarchy_errors'] ?? 0;
	}

	public function reset_stats(): void {
		$this->initialize_creation_stats();
	}

	private function initialize_creation_stats(): void {
		$this->creation_stats = [
			'widgets_created' => 0,
			'widgets_failed' => 0,
			'global_classes_created' => 0,
			'variables_created' => 0,
			'errors' => [],
			'warnings' => [],
		];
	}
}
