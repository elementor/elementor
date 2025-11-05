<?php
namespace Elementor\Modules\CssConverter\Services\Css\Processing;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Selector_Matcher_Engine {

	private $parser;
	private $navigator;
	private $parsed_selector_cache = [];
	private const CACHE_SIZE_LIMIT = 1000;

	public function __construct(
		CSS_Selector_Parser $parser = null,
		Widget_Tree_Navigator $navigator = null
	) {
		$this->parser = $parser ?? new CSS_Selector_Parser();
		$this->navigator = $navigator ?? new Widget_Tree_Navigator();
	}

	public function find_matching_widgets( string $selector, array $widgets ): array {
		return $this->find_matching_widgets_intelligently( $selector, $widgets );
	}

	/**
	 * General CSS selector matching - works for any selector pattern
	 */
	private function find_matching_widgets_intelligently( string $selector, array $widgets ): array {
		$this->navigator->build_widget_index( $widgets );

		return $this->find_matching_widgets_standard( $selector, $widgets );
	}

	/**
	 * Standard selector matching (original logic)
	 * CRITICAL FIX: Match last part first with recursive parent validation
	 */
	private function find_matching_widgets_standard( string $selector, array $widgets ): array {
		$parsed_selector = $this->get_parsed_selector( $selector );
		$matching_element_ids = [];

		// CRITICAL FIX: For complex selectors (e.g., .e-con>.e-con-inner),
		// we need to pass ALL widgets to widget_matches_parsed_selector for parent chain validation
		foreach ( $widgets as $widget ) {
			$element_id = $widget['element_id'] ?? null;

			if ( $element_id && $this->widget_matches_parsed_selector( $widget, $parsed_selector, $widgets ) ) {
				$matching_element_ids[] = $element_id;
			}

			if ( ! empty( $widget['children'] ) ) {
				$child_matches = $this->find_matching_widgets_recursively( $parsed_selector, $widget['children'], $widgets );
				$matching_element_ids = array_merge( $matching_element_ids, $child_matches );
			}
		}

		return array_unique( $matching_element_ids );
	}


	private function find_matching_widgets_recursively( array $parsed_selector, array $widgets, array $all_widgets = null ): array {
		$matching_element_ids = [];

		// CRITICAL FIX: Pass all_widgets for parent chain validation
		$widgets_for_validation = $all_widgets ?? $widgets;

		foreach ( $widgets as $widget ) {
			$element_id = $widget['element_id'] ?? null;

			if ( $element_id && $this->widget_matches_parsed_selector( $widget, $parsed_selector, $widgets_for_validation ) ) {
				$matching_element_ids[] = $element_id;
			}

			if ( ! empty( $widget['children'] ) ) {
				$child_matches = $this->find_matching_widgets_recursively( $parsed_selector, $widget['children'], $widgets_for_validation );
				$matching_element_ids = array_merge( $matching_element_ids, $child_matches );
			}
		}

		return $matching_element_ids;
	}

	public function widget_matches_selector( string $selector, array $widget, array $all_widgets = null ): bool {
		if ( $all_widgets ) {
			$this->navigator->build_widget_index( $all_widgets );
		}

		$parsed_selector = $this->get_parsed_selector( $selector );

		return $this->widget_matches_parsed_selector( $widget, $parsed_selector, $all_widgets );
	}

	private function widget_matches_parsed_selector( array $widget, array $parsed_selector, ?array $all_widgets ): bool {
		if ( $parsed_selector['type'] === 'complex' ) {
			return $this->match_complex_selector( $widget, $parsed_selector, $all_widgets );
		}

		if ( $parsed_selector['type'] === 'compound' ) {
			return $this->match_compound_selector( $widget, $parsed_selector );
		}

		return $this->match_simple_selector( $widget, $parsed_selector );
	}

	private function match_complex_selector( array $widget, array $parsed_selector, ?array $all_widgets ): bool {
		$parts = $parsed_selector['parts'];
		$combinators = $parsed_selector['combinators'];

		if ( empty( $parts ) ) {
			return false;
		}

		$target_part = end( $parts );
		$widget_classes = $widget['attributes']['class'] ?? '';
		$element_id = $widget['element_id'] ?? '';

		if ( ! $this->widget_matches_parsed_selector( $widget, $target_part, $all_widgets ) ) {
			return false;
		}

		if ( count( $parts ) === 1 ) {
			return true;
		}

		$chain_valid = $this->validate_selector_chain( $widget, $parts, $combinators, $all_widgets );

		return $chain_valid;
	}

	private function validate_selector_chain( array $widget, array $parts, array $combinators, ?array $all_widgets ): bool {
		$element_id = $widget['element_id'] ?? null;

		if ( ! $element_id || ! $all_widgets ) {
			return false;
		}

		$current_widget = $widget;
		$parts_count = count( $parts );

		for ( $i = $parts_count - 2; $i >= 0; $i-- ) {
			$combinator = $combinators[ $i ] ?? ' ';
			$required_part = $parts[ $i ];

			$matching_widget = $this->find_widget_by_combinator(
				$current_widget,
				$combinator,
				$required_part,
				$all_widgets
			);

			if ( ! $matching_widget ) {
				return false;
			}

			$current_widget = $matching_widget;
		}

		return true;
	}

	private function find_widget_by_combinator( array $widget, string $combinator, array $required_part, array $all_widgets ): ?array {
		$element_id = $widget['element_id'] ?? null;

		if ( ! $element_id ) {
			return null;
		}

		switch ( trim( $combinator ) ) {
			case ' ':
				return $this->find_ancestor_matching_part( $element_id, $required_part );
			case '>':
				return $this->find_parent_matching_part( $element_id, $required_part );
			case '+':
				return $this->find_previous_sibling_matching_part( $element_id, $required_part );
			case '~':
				return $this->find_preceding_sibling_matching_part( $element_id, $required_part );
			default:
				return null;
		}
	}

	private function find_ancestor_matching_part( string $element_id, array $required_part ): ?array {
		$ancestors = $this->navigator->find_ancestors( $element_id );

		foreach ( $ancestors as $ancestor ) {
			if ( $this->widget_matches_parsed_selector( $ancestor, $required_part, null ) ) {
				return $ancestor;
			}
		}

		return null;
	}

	private function find_parent_matching_part( string $element_id, array $required_part ): ?array {
		$parent = $this->navigator->find_parent( $element_id );

		if ( $parent && $this->widget_matches_parsed_selector( $parent, $required_part, null ) ) {
			return $parent;
		}

		return null;
	}

	private function find_previous_sibling_matching_part( string $element_id, array $required_part ): ?array {
		$previous_sibling = $this->navigator->find_previous_sibling( $element_id );

		if ( $previous_sibling && $this->widget_matches_parsed_selector( $previous_sibling, $required_part, null ) ) {
			return $previous_sibling;
		}

		return null;
	}

	private function find_preceding_sibling_matching_part( string $element_id, array $required_part ): ?array {
		$all_siblings = $this->navigator->find_all_siblings( $element_id, false );

		$element_index = null;
		$sibling_info = $this->navigator->sibling_map[ $element_id ] ?? null;

		if ( $sibling_info ) {
			$element_index = $sibling_info['index'];
		}

		if ( $element_index === null ) {
			return null;
		}

		foreach ( $all_siblings as $sibling ) {
			$sibling_id = $sibling['element_id'] ?? null;
			$sibling_info = $this->navigator->sibling_map[ $sibling_id ] ?? null;

			if ( $sibling_info && $sibling_info['index'] < $element_index ) {
				if ( $this->widget_matches_parsed_selector( $sibling, $required_part, null ) ) {
					return $sibling;
				}
			}
		}

		return null;
	}

	private function match_compound_selector( array $widget, array $parsed_selector ): bool {
		$parts = $parsed_selector['parts'] ?? [];

		foreach ( $parts as $part ) {
			if ( ! $this->match_simple_selector( $widget, $part ) ) {
				return false;
			}
		}

		return true;
	}

	private function match_simple_selector( array $widget, array $selector_part ): bool {
		switch ( $selector_part['type'] ) {
			case 'class':
				return $this->widget_has_class( $widget, $selector_part['value'] );
			case 'id':
				return $this->widget_has_id( $widget, $selector_part['value'] );
			case 'element':
				return $this->widget_matches_element( $widget, $selector_part['value'] );
			case 'attribute':
				return $this->widget_matches_attribute( $widget, $selector_part );
			case 'pseudo-class':
				return $this->widget_matches_pseudo_class( $widget, $selector_part );
			case 'pseudo-element':
				return false;
			default:
				return false;
		}
	}

	private function widget_has_class( array $widget, string $class_name ): bool {
		$classes = $widget['attributes']['class'] ?? '';

		if ( ! empty( $classes ) ) {
			$widget_classes = preg_split( '/\s+/', trim( $classes ) );

			if ( in_array( $class_name, $widget_classes, true ) ) {
				return true;
			}
		}

		$widget_type = $this->map_class_to_widget_type( $class_name );
		if ( $widget_type && ( $widget['widget_type'] ?? '' ) === $widget_type ) {
			return true;
		}

		return false;
	}

	private function map_class_to_widget_type( string $class_name ): ?string {
		$class_to_widget_map = [
			'elementor-heading-title' => 'e-heading',
			'elementor-widget-heading' => 'e-heading',
			'elementor-widget-image' => 'e-image',
			'elementor-widget-text-editor' => 'e-paragraph',
			'elementor-widget-button' => 'e-button',
			'elementor-widget-link' => 'e-link',
			'elementor-widget-text' => 'e-text',
		];

		return $class_to_widget_map[ $class_name ] ?? null;
	}

	private function widget_has_id( array $widget, string $id_value ): bool {
		$widget_id = $widget['attributes']['id'] ?? '';

		return $widget_id === $id_value;
	}

	private function widget_matches_element( array $widget, string $element_name ): bool {
		$widget_tag = $widget['tag'] ?? '';
		$widget_type = $widget['widget_type'] ?? '';

		if ( $widget_tag === $element_name ) {
			return true;
		}

		$element_to_widget_map = [
			'div' => [ 'e-div-block' ],
			'p' => [ 'e-paragraph' ],
			'h1' => [ 'e-heading' ],
			'h2' => [ 'e-heading' ],
			'h3' => [ 'e-heading' ],
			'h4' => [ 'e-heading' ],
			'h5' => [ 'e-heading' ],
			'h6' => [ 'e-heading' ],
			'a' => [ 'e-link' ],
			'img' => [ 'e-image' ],
			'button' => [ 'e-button' ],
			'span' => [ 'e-text' ],
		];

		$mapped_widgets = $element_to_widget_map[ $element_name ] ?? [];

		return in_array( $widget_type, $mapped_widgets, true );
	}

	private function widget_matches_attribute( array $widget, array $attribute_selector ): bool {
		$attribute_name = $attribute_selector['attribute'];
		$operator = $attribute_selector['operator'] ?? null;
		$expected_value = $attribute_selector['value'] ?? null;

		$widget_attributes = $widget['attributes'] ?? [];

		if ( ! isset( $widget_attributes[ $attribute_name ] ) ) {
			return false;
		}

		$actual_value = $widget_attributes[ $attribute_name ];

		if ( $operator === null ) {
			return true;
		}

		switch ( $operator ) {
			case '=':
				return $actual_value === $expected_value;
			case '~=':
				$values = preg_split( '/\s+/', $actual_value );
				return in_array( $expected_value, $values, true );
			case '|=':
				return $actual_value === $expected_value || strpos( $actual_value, $expected_value . '-' ) === 0;
			case '^=':
				return strpos( $actual_value, $expected_value ) === 0;
			case '$=':
				return substr( $actual_value, -strlen( $expected_value ) ) === $expected_value;
			case '*=':
				return strpos( $actual_value, $expected_value ) !== false;
			default:
				return false;
		}
	}

	private function widget_matches_pseudo_class( array $widget, array $pseudo_class ): bool {
		$name = $pseudo_class['name'];
		$argument = $pseudo_class['argument'] ?? null;

		switch ( $name ) {
			case 'not':
				if ( $argument ) {
					try {
						$negated_selector = $this->parser->parse( $argument );
						return ! $this->widget_matches_parsed_selector( $widget, $negated_selector, null );
					} catch ( \Exception $e ) {
						return false;
					}
				}
				return false;

			case 'first-child':
				return $this->is_first_child( $widget );

			case 'last-child':
				return $this->is_last_child( $widget );

			case 'only-child':
				return $this->is_only_child( $widget );

			case 'nth-child':
				if ( $argument ) {
					return $this->matches_nth_child( $widget, $argument );
				}
				return false;

			case 'empty':
				return $this->is_empty_widget( $widget );

			default:
				return false;
		}
	}

	private function is_first_child( array $widget ): bool {
		$element_id = $widget['element_id'] ?? null;

		if ( ! $element_id ) {
			return false;
		}

		$previous_sibling = $this->navigator->find_previous_sibling( $element_id );

		return $previous_sibling === null;
	}

	private function is_last_child( array $widget ): bool {
		$element_id = $widget['element_id'] ?? null;

		if ( ! $element_id ) {
			return false;
		}

		$next_sibling = $this->navigator->find_next_sibling( $element_id );

		return $next_sibling === null;
	}

	private function is_only_child( array $widget ): bool {
		return $this->is_first_child( $widget ) && $this->is_last_child( $widget );
	}

	private function matches_nth_child( array $widget, string $formula ): bool {
		$element_id = $widget['element_id'] ?? null;

		if ( ! $element_id ) {
			return false;
		}

		$siblings = $this->navigator->find_all_siblings( $element_id, true );
		$position = 1;

		foreach ( $siblings as $index => $sibling ) {
			$sibling_id = $sibling['element_id'] ?? null;
			if ( $sibling_id === $element_id ) {
				$position = $index + 1;
				break;
			}
		}

		return $this->evaluate_nth_formula( $formula, $position );
	}

	private function evaluate_nth_formula( string $formula, int $position ): bool {
		$formula = trim( $formula );

		if ( $formula === 'odd' ) {
			return $position % 2 === 1;
		}

		if ( $formula === 'even' ) {
			return $position % 2 === 0;
		}

		if ( is_numeric( $formula ) ) {
			return $position === (int) $formula;
		}

		if ( preg_match( '/^(-?\d*)n(?:\s*([+-]\s*\d+))?$/', $formula, $matches ) ) {
			$a = $matches[1] === '' ? 1 : (int) $matches[1];
			$b = isset( $matches[2] ) ? (int) str_replace( ' ', '', $matches[2] ) : 0;

			if ( $a === 0 ) {
				return $position === $b;
			}

			if ( $a > 0 ) {
				return $position >= $b && ( $position - $b ) % $a === 0;
			} else {
				return $position <= $b && ( $b - $position ) % abs( $a ) === 0;
			}
		}

		return false;
	}

	private function is_empty_widget( array $widget ): bool {
		$children = $widget['children'] ?? [];
		$content = $widget['content'] ?? '';

		return empty( $children ) && empty( trim( $content ) );
	}

	private function get_parsed_selector( string $selector ): array {
		if ( isset( $this->parsed_selector_cache[ $selector ] ) ) {
			return $this->parsed_selector_cache[ $selector ];
		}

		if ( count( $this->parsed_selector_cache ) >= self::CACHE_SIZE_LIMIT ) {
			$this->parsed_selector_cache = array_slice(
				$this->parsed_selector_cache,
				self::CACHE_SIZE_LIMIT / 2,
				null,
				true
			);
		}

		$parsed = $this->parser->parse( $selector );
		$this->parsed_selector_cache[ $selector ] = $parsed;

		return $parsed;
	}

	public function get_cache_statistics(): array {
		return [
			'cached_selectors' => count( $this->parsed_selector_cache ),
			'cache_limit' => self::CACHE_SIZE_LIMIT,
			'cache_usage_percent' => ( count( $this->parsed_selector_cache ) / self::CACHE_SIZE_LIMIT ) * 100,
		];
	}

	public function clear_cache(): void {
		$this->parsed_selector_cache = [];
	}
}
