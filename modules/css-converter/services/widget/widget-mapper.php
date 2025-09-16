<?php
namespace Elementor\Modules\CssConverter\Services\Widget;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Widget_Mapper {
	private $mapping_rules;
	private $handlers;

	public function __construct() {
		$this->init_mapping_rules();
		$this->init_handlers();
	}

	private function init_mapping_rules() {
		// HVV Decision: Use flexbox widgets only (containers are v3/deprecated)
		$this->mapping_rules = [
			// Headings
			'h1' => 'e-heading',
			'h2' => 'e-heading',
			'h3' => 'e-heading',
			'h4' => 'e-heading',
			'h5' => 'e-heading',
			'h6' => 'e-heading',
			
			// Text elements
			'p' => 'e-paragraph',
			
			// Container elements - always use flexbox (HVV decision)
			'div' => 'e-flexbox',
			'section' => 'e-flexbox',
			'article' => 'e-flexbox',
			'aside' => 'e-flexbox',
			'header' => 'e-flexbox',
			'footer' => 'e-flexbox',
			'main' => 'e-flexbox',
			'nav' => 'e-flexbox',
			
			// Interactive elements
			'a' => 'e-link',
			'button' => 'e-button',
			
			// Media elements
			'img' => 'e-image',
			
			// Inline elements that can be converted to flexbox
			'span' => 'e-flexbox',
		];

		// Allow filtering of mapping rules
		$this->mapping_rules = apply_filters( 'elementor_widget_converter_mapping_rules', $this->mapping_rules );
	}

	private function init_handlers() {
		$this->handlers = [
			'e-heading' => [ $this, 'handle_heading' ],
			'e-paragraph' => [ $this, 'handle_paragraph' ],
			'e-flexbox' => [ $this, 'handle_flexbox' ],
			'e-link' => [ $this, 'handle_link' ],
			'e-button' => [ $this, 'handle_button' ],
			'e-image' => [ $this, 'handle_image' ],
		];
	}

	public function map_element( $element ) {
		$tag = $element['tag'];
		
		// Check if we have a mapping for this tag
		if ( ! isset( $this->mapping_rules[ $tag ] ) ) {
			return $this->handle_unsupported_element( $element );
		}

		$widget_type = $this->mapping_rules[ $tag ];
		
		// Check if we have a handler for this widget type
		if ( ! isset( $this->handlers[ $widget_type ] ) ) {
			return $this->handle_unsupported_element( $element );
		}

		// Call the appropriate handler
		$handler = $this->handlers[ $widget_type ];
		return call_user_func( $handler, $element );
	}

	public function map_elements( $elements ) {
		$mapped_elements = [];

		foreach ( $elements as $element ) {
			$mapped = $this->map_element( $element );
			if ( $mapped ) {
				$mapped_elements[] = $mapped;
			}
		}

		return $mapped_elements;
	}

	private function handle_heading( $element ) {
		$tag = $element['tag'];
		$level = (int) substr( $tag, 1 ); // Extract number from h1, h2, etc.

		return [
			'widget_type' => 'e-heading',
			'original_tag' => $tag,
			'settings' => [
				'text' => $element['content'],
				'tag' => $tag,
				'level' => $level,
			],
			'attributes' => $element['attributes'],
			'inline_css' => $element['inline_css'] ?? [],
			'children' => [], // Headings don't have widget children
		];
	}

	private function handle_paragraph( $element ) {
		return [
			'widget_type' => 'e-paragraph',
			'original_tag' => 'p',
			'settings' => [
				'text' => $element['content'],
			],
			'attributes' => $element['attributes'],
			'inline_css' => $element['inline_css'] ?? [],
			'children' => [], // Paragraphs don't have widget children
		];
	}

	private function handle_flexbox( $element ) {
		// Map children recursively
		$children = [];
		if ( ! empty( $element['children'] ) ) {
			$children = $this->map_elements( $element['children'] );
		}

		// Determine flexbox direction from CSS or default to column
		$direction = $this->determine_flex_direction( $element );

		return [
			'widget_type' => 'e-flexbox',
			'original_tag' => $element['tag'],
			'settings' => [
				'direction' => $direction,
				'wrap' => 'nowrap', // Default, can be overridden by CSS
				'justify_content' => 'flex-start', // Default
				'align_items' => 'stretch', // Default
			],
			'attributes' => $element['attributes'],
			'inline_css' => $element['inline_css'] ?? [],
			'children' => $children,
		];
	}

	private function handle_link( $element ) {
		$href = $element['attributes']['href'] ?? '#';
		$target = $element['attributes']['target'] ?? '_self';

		return [
			'widget_type' => 'e-link',
			'original_tag' => 'a',
			'settings' => [
				'text' => $element['content'],
				'url' => $href,
				'target' => $target,
			],
			'attributes' => $element['attributes'],
			'inline_css' => $element['inline_css'] ?? [],
			'children' => [], // Links don't have widget children in this context
		];
	}

	private function handle_button( $element ) {
		$type = $element['attributes']['type'] ?? 'button';
		
		return [
			'widget_type' => 'e-button',
			'original_tag' => 'button',
			'settings' => [
				'text' => $element['content'],
				'type' => $type,
			],
			'attributes' => $element['attributes'],
			'inline_css' => $element['inline_css'] ?? [],
			'children' => [],
		];
	}

	private function handle_image( $element ) {
		$src = $element['attributes']['src'] ?? '';
		$alt = $element['attributes']['alt'] ?? '';
		$width = $element['attributes']['width'] ?? '';
		$height = $element['attributes']['height'] ?? '';

		return [
			'widget_type' => 'e-image',
			'original_tag' => 'img',
			'settings' => [
				'src' => $src,
				'alt' => $alt,
				'width' => $width,
				'height' => $height,
			],
			'attributes' => $element['attributes'],
			'inline_css' => $element['inline_css'] ?? [],
			'children' => [],
		];
	}

	private function handle_unsupported_element( $element ) {
		// HVV Decision: Skip unsupported elements for MVP
		// Return null to indicate this element should be skipped
		return null;
	}

	private function determine_flex_direction( $element ) {
		// Check inline CSS for flex-direction
		if ( ! empty( $element['inline_css']['flex-direction'] ) ) {
			return $element['inline_css']['flex-direction']['value'];
		}

		// Check for display: flex and other flex properties
		if ( ! empty( $element['inline_css']['display'] ) && 
			 $element['inline_css']['display']['value'] === 'flex' ) {
			// Default to row for explicit flex containers
			return 'row';
		}

		// Default to column for block-level elements
		$block_elements = [ 'div', 'section', 'article', 'aside', 'header', 'footer', 'main', 'nav' ];
		if ( in_array( $element['tag'], $block_elements, true ) ) {
			return 'column';
		}

		// Default to row for inline elements
		return 'row';
	}

	public function get_supported_tags() {
		return array_keys( $this->mapping_rules );
	}

	public function is_supported( $tag ) {
		return isset( $this->mapping_rules[ $tag ] );
	}

	public function get_widget_type_for_tag( $tag ) {
		return $this->mapping_rules[ $tag ] ?? null;
	}

	public function get_mapping_stats( $elements ) {
		$stats = [
			'total_elements' => 0,
			'supported_elements' => 0,
			'unsupported_elements' => 0,
			'widget_types' => [],
			'unsupported_tags' => [],
		];

		$this->collect_mapping_stats( $elements, $stats );

		return $stats;
	}

	private function collect_mapping_stats( $elements, &$stats ) {
		foreach ( $elements as $element ) {
			$stats['total_elements']++;
			
			$tag = $element['tag'];
			if ( $this->is_supported( $tag ) ) {
				$stats['supported_elements']++;
				$widget_type = $this->get_widget_type_for_tag( $tag );
				$stats['widget_types'][ $widget_type ] = ( $stats['widget_types'][ $widget_type ] ?? 0 ) + 1;
			} else {
				$stats['unsupported_elements']++;
				$stats['unsupported_tags'][] = $tag;
			}

			// Recursively process children
			if ( ! empty( $element['children'] ) ) {
				$this->collect_mapping_stats( $element['children'], $stats );
			}
		}

		// Remove duplicates from unsupported tags
		$stats['unsupported_tags'] = array_unique( $stats['unsupported_tags'] );
	}
}
