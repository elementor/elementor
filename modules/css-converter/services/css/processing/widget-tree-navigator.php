<?php
namespace Elementor\Modules\CssConverter\Services\Css\Processing;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Widget_Tree_Navigator {

	private $widget_index = [];
	private $parent_map = [];
	private $children_map = [];
	private $sibling_map = [];
	private $is_indexed = false;

	public function build_widget_index( array $widgets ): array {
		$this->widget_index = [];
		$this->parent_map = [];
		$this->children_map = [];
		$this->sibling_map = [];
		
		$this->index_widgets_recursively( $widgets, null );
		$this->build_sibling_relationships( $widgets );
		
		$this->is_indexed = true;
		
		return $this->widget_index;
	}

	private function index_widgets_recursively( array $widgets, ?string $parent_id ): void {
		foreach ( $widgets as $index => $widget ) {
			$element_id = $widget['element_id'] ?? null;
			
			if ( ! $element_id ) {
				continue;
			}
			
			$this->widget_index[ $element_id ] = $widget;
			
			if ( $parent_id ) {
				$this->parent_map[ $element_id ] = $parent_id;
				
				if ( ! isset( $this->children_map[ $parent_id ] ) ) {
					$this->children_map[ $parent_id ] = [];
				}
				$this->children_map[ $parent_id ][] = $element_id;
			}
			
			if ( ! empty( $widget['children'] ) ) {
				$this->index_widgets_recursively( $widget['children'], $element_id );
			}
		}
	}

	private function build_sibling_relationships( array $widgets ): void {
		$this->build_sibling_relationships_recursively( $widgets );
	}

	private function build_sibling_relationships_recursively( array $widgets ): void {
		$sibling_ids = [];
		
		foreach ( $widgets as $widget ) {
			$element_id = $widget['element_id'] ?? null;
			if ( $element_id ) {
				$sibling_ids[] = $element_id;
			}
		}
		
		foreach ( $sibling_ids as $index => $element_id ) {
			$this->sibling_map[ $element_id ] = [
				'all' => $sibling_ids,
				'previous' => $index > 0 ? $sibling_ids[ $index - 1 ] : null,
				'next' => $index < count( $sibling_ids ) - 1 ? $sibling_ids[ $index + 1 ] : null,
				'index' => $index,
			];
		}
		
		foreach ( $widgets as $widget ) {
			if ( ! empty( $widget['children'] ) ) {
				$this->build_sibling_relationships_recursively( $widget['children'] );
			}
		}
	}

	public function find_widget_by_id( string $element_id ): ?array {
		$this->ensure_indexed();
		
		return $this->widget_index[ $element_id ] ?? null;
	}

	public function find_parent( string $element_id ): ?array {
		$this->ensure_indexed();
		
		$parent_id = $this->parent_map[ $element_id ] ?? null;
		
		if ( ! $parent_id ) {
			return null;
		}
		
		return $this->widget_index[ $parent_id ] ?? null;
	}

	public function find_ancestors( string $element_id ): array {
		$this->ensure_indexed();
		
		$ancestors = [];
		$current_id = $element_id;
		
		while ( isset( $this->parent_map[ $current_id ] ) ) {
			$parent_id = $this->parent_map[ $current_id ];
			$parent_widget = $this->widget_index[ $parent_id ] ?? null;
			
			if ( $parent_widget ) {
				$ancestors[] = $parent_widget;
				$current_id = $parent_id;
			} else {
				break;
			}
		}
		
		return $ancestors;
	}

	public function find_children( string $element_id ): array {
		$this->ensure_indexed();
		
		$child_ids = $this->children_map[ $element_id ] ?? [];
		$children = [];
		
		foreach ( $child_ids as $child_id ) {
			$child_widget = $this->widget_index[ $child_id ] ?? null;
			if ( $child_widget ) {
				$children[] = $child_widget;
			}
		}
		
		return $children;
	}

	public function find_descendants( string $element_id ): array {
		$this->ensure_indexed();
		
		$descendants = [];
		$children = $this->find_children( $element_id );
		
		foreach ( $children as $child ) {
			$child_id = $child['element_id'] ?? null;
			if ( $child_id ) {
				$descendants[] = $child;
				$child_descendants = $this->find_descendants( $child_id );
				$descendants = array_merge( $descendants, $child_descendants );
			}
		}
		
		return $descendants;
	}

	public function find_next_sibling( string $element_id ): ?array {
		$this->ensure_indexed();
		
		$sibling_info = $this->sibling_map[ $element_id ] ?? null;
		
		if ( ! $sibling_info || ! $sibling_info['next'] ) {
			return null;
		}
		
		return $this->widget_index[ $sibling_info['next'] ] ?? null;
	}

	public function find_previous_sibling( string $element_id ): ?array {
		$this->ensure_indexed();
		
		$sibling_info = $this->sibling_map[ $element_id ] ?? null;
		
		if ( ! $sibling_info || ! $sibling_info['previous'] ) {
			return null;
		}
		
		return $this->widget_index[ $sibling_info['previous'] ] ?? null;
	}

	public function find_all_siblings( string $element_id, bool $include_self = false ): array {
		$this->ensure_indexed();
		
		$sibling_info = $this->sibling_map[ $element_id ] ?? null;
		
		if ( ! $sibling_info ) {
			return [];
		}
		
		$sibling_ids = $sibling_info['all'];
		
		if ( ! $include_self ) {
			$sibling_ids = array_filter( $sibling_ids, function( $id ) use ( $element_id ) {
				return $id !== $element_id;
			} );
		}
		
		$siblings = [];
		foreach ( $sibling_ids as $sibling_id ) {
			$sibling_widget = $this->widget_index[ $sibling_id ] ?? null;
			if ( $sibling_widget ) {
				$siblings[] = $sibling_widget;
			}
		}
		
		return $siblings;
	}

	public function widget_has_ancestor_matching( string $element_id, callable $matcher ): bool {
		$ancestors = $this->find_ancestors( $element_id );
		
		foreach ( $ancestors as $ancestor ) {
			if ( $matcher( $ancestor ) ) {
				return true;
			}
		}
		
		return false;
	}

	public function widget_has_descendant_matching( string $element_id, callable $matcher ): bool {
		$descendants = $this->find_descendants( $element_id );
		
		foreach ( $descendants as $descendant ) {
			if ( $matcher( $descendant ) ) {
				return true;
			}
		}
		
		return false;
	}

	public function find_widgets_matching( array $widgets, callable $matcher ): array {
		if ( ! $this->is_indexed ) {
			$this->build_widget_index( $widgets );
		}
		
		$matches = [];
		
		foreach ( $this->widget_index as $element_id => $widget ) {
			if ( $matcher( $widget ) ) {
				$matches[] = $widget;
			}
		}
		
		return $matches;
	}

	public function validate_parent_child_relationship( string $parent_id, string $child_id ): bool {
		$this->ensure_indexed();
		
		$child_parent_id = $this->parent_map[ $child_id ] ?? null;
		
		return $child_parent_id === $parent_id;
	}

	public function validate_ancestor_descendant_relationship( string $ancestor_id, string $descendant_id ): bool {
		$this->ensure_indexed();
		
		$current_id = $descendant_id;
		
		while ( isset( $this->parent_map[ $current_id ] ) ) {
			$parent_id = $this->parent_map[ $current_id ];
			
			if ( $parent_id === $ancestor_id ) {
				return true;
			}
			
			$current_id = $parent_id;
		}
		
		return false;
	}

	public function validate_sibling_relationship( string $element_id_1, string $element_id_2 ): bool {
		$this->ensure_indexed();
		
		$sibling_info_1 = $this->sibling_map[ $element_id_1 ] ?? null;
		$sibling_info_2 = $this->sibling_map[ $element_id_2 ] ?? null;
		
		if ( ! $sibling_info_1 || ! $sibling_info_2 ) {
			return false;
		}
		
		return in_array( $element_id_2, $sibling_info_1['all'], true );
	}

	public function validate_adjacent_sibling_relationship( string $first_id, string $second_id ): bool {
		$this->ensure_indexed();
		
		$first_sibling_info = $this->sibling_map[ $first_id ] ?? null;
		
		if ( ! $first_sibling_info ) {
			return false;
		}
		
		return $first_sibling_info['next'] === $second_id;
	}

	public function get_widget_path( string $element_id ): array {
		$this->ensure_indexed();
		
		$path = [];
		$current_widget = $this->widget_index[ $element_id ] ?? null;
		
		if ( ! $current_widget ) {
			return $path;
		}
		
		$path[] = $current_widget;
		$ancestors = $this->find_ancestors( $element_id );
		
		return array_merge( array_reverse( $ancestors ), $path );
	}

	public function get_statistics(): array {
		$this->ensure_indexed();
		
		return [
			'total_widgets' => count( $this->widget_index ),
			'widgets_with_parents' => count( $this->parent_map ),
			'widgets_with_children' => count( $this->children_map ),
			'max_depth' => $this->calculate_max_depth(),
			'average_children_per_parent' => $this->calculate_average_children_per_parent(),
		];
	}

	private function calculate_max_depth(): int {
		$max_depth = 0;
		
		foreach ( array_keys( $this->widget_index ) as $element_id ) {
			$depth = count( $this->find_ancestors( $element_id ) );
			$max_depth = max( $max_depth, $depth );
		}
		
		return $max_depth;
	}

	private function calculate_average_children_per_parent(): float {
		if ( empty( $this->children_map ) ) {
			return 0.0;
		}
		
		$total_children = 0;
		foreach ( $this->children_map as $children ) {
			$total_children += count( $children );
		}
		
		return $total_children / count( $this->children_map );
	}

	private function ensure_indexed(): void {
		if ( ! $this->is_indexed ) {
			throw new \RuntimeException( 'Widget index not built. Call build_widget_index() first.' );
		}
	}

	public function reset(): void {
		$this->widget_index = [];
		$this->parent_map = [];
		$this->children_map = [];
		$this->sibling_map = [];
		$this->is_indexed = false;
	}
}
