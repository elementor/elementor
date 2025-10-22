<?php
namespace Elementor\Modules\CssConverter\Services\Widgets;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Widget_Mapper {
	private $mapping_rules;
	private $handlers;
	private $element_id_counter = 0;

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
			'blockquote' => 'e-paragraph', // Treat blockquote as paragraph with special styling

			// Container elements - use div-block for simple containers
			'div' => 'e-div-block',
			'section' => 'e-div-block',
			'article' => 'e-div-block',
			'aside' => 'e-div-block',
			'header' => 'e-div-block',
			'footer' => 'e-div-block',
			'main' => 'e-div-block',
			'nav' => 'e-div-block',

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
			'e-div-block' => [ $this, 'handle_div_block' ],
			'e-flexbox' => [ $this, 'handle_flexbox' ],
			'e-link' => [ $this, 'handle_link' ],
			'e-button' => [ $this, 'handle_button' ],
			'e-image' => [ $this, 'handle_image' ],
		];
	}

	public function map_element( $element ) {
		$tag = $element['tag'];
		$element_class = $element['attributes']['class'] ?? '';
		
		// DEBUG: Log element mapping input
		error_log( "🔍 WIDGET_MAPPER DEBUG: Mapping element - Tag: {$tag}, Class: '{$element_class}'" );
		error_log( "🔍 WIDGET_MAPPER DEBUG: Element attributes: " . json_encode( $element['attributes'] ?? [] ) );

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
		$widget = call_user_func( $handler, $element );
		
		// DEBUG: Log widget mapping output
		$widget_class = $widget['attributes']['class'] ?? '';
		error_log( "🔍 WIDGET_MAPPER DEBUG: Mapped to widget - Type: {$widget_type}, Class: '{$widget_class}'" );
		error_log( "🔍 WIDGET_MAPPER DEBUG: Widget attributes: " . json_encode( $widget['attributes'] ?? [] ) );

		// Add generated class name to widget attributes if it exists
		if ( ! empty( $element['generated_class'] ) ) {
			$widget = $this->add_generated_class_to_widget( $widget, $element['generated_class'] );
		}

		return $widget;
	}

	private function add_generated_class_to_widget( $widget, $generated_class ) {
		// Add the generated class name to the widget's attributes
		if ( ! isset( $widget['attributes'] ) ) {
			$widget['attributes'] = [];
		}

		if ( ! isset( $widget['attributes']['class'] ) ) {
			$widget['attributes']['class'] = $generated_class;
		} else {
			// Append to existing class attribute
			$widget['attributes']['class'] .= ' ' . $generated_class;
		}

		return $widget;
	}

	public function map_elements( $elements ) {
		$mapped_elements = [];


		foreach ( $elements as $element ) {
			$mapped = $this->map_element( $element );
			if ( $mapped ) {
				$mapped_elements[] = $mapped;

				// DOUBLE NESTING DEBUG: Check for nested structure that might cause double div-blocks
				if ( ! empty( $mapped['children'] ) ) {
					foreach ( $mapped['children'] as $child_index => $child ) {
						$child_type = $child['widget_type'] ?? 'unknown';
						$child_tag = $child['original_tag'] ?? 'unknown';
						
						// Check for problematic double div-block nesting
						if ( $mapped['widget_type'] === 'e-div-block' && $child_type === 'e-div-block' ) {
						}
					}
				}
			}
		}

		return $mapped_elements;
	}

	private function generate_element_id( $element ): string {
		$html_id = $element['attributes']['id'] ?? null;
		if ( $html_id ) {
			return 'element-' . $html_id;
		}

		++$this->element_id_counter;
		$tag = $element['tag'] ?? 'unknown';
		return "element-{$tag}-{$this->element_id_counter}";
	}

	private function handle_heading( $element ) {
		$tag = $element['tag'];
		$level = (int) substr( $tag, 1 ); // Extract number from h1, h2, etc.
		$content = $element['content'] ?? '';
		$element_id = $this->generate_element_id( $element );

		return [
			'widget_type' => 'e-heading',
			'element_id' => $element_id,
			'original_tag' => $tag,
			'settings' => [
				'text' => $content,
				'tag' => $tag,
				'level' => $level,
			],
			'attributes' => $element['attributes'],
			'inline_css' => $element['inline_css'] ?? [],
			'children' => [], // Headings don't have widget children
		];
	}

	private function handle_paragraph( $element ) {
		$content = $element['content'] ?? '';
		$tag = $element['tag'];
		$element_id = $this->generate_element_id( $element );

		// CRITICAL FIX: Always create e-paragraph widgets, never e-div-block containers
		// This prevents double nesting while preserving child elements like links
		
		// If paragraph has child elements (like <a> tags), we need to handle mixed content
		if ( ! empty( $element['children'] ) ) {
			
			// For mixed content paragraphs, we'll create a flattened structure:
			// Instead of: e-div-block > [e-paragraph, e-link]  
			// We create: e-paragraph (with consolidated text) + separate child widgets
			
			// Extract text content that's not part of child elements
			$child_text = $this->extract_text_from_children( $element['children'] );
			$remaining_text = trim( str_replace( $child_text, '', $content ) );
			
			// Combine all text content for the paragraph widget
			$full_text_content = trim( $content );
			if ( empty( $full_text_content ) ) {
				$full_text_content = $remaining_text;
			}
			
			
			// Create the main paragraph widget with all text content
			$paragraph_widget = [
				'widget_type' => 'e-paragraph',
				'element_id' => $element_id,
				'original_tag' => $tag,
				'settings' => [
					'paragraph' => $full_text_content,
				],
				'attributes' => $element['attributes'],
				'inline_css' => $element['inline_css'] ?? [],
				'children' => [], // Paragraphs don't have widget children
			];
			
			// Map child elements (like links) as separate widgets
			$child_widgets = $this->map_elements( $element['children'] );
			
			// Return flattened structure: paragraph + child widgets as siblings
			// This will be handled by the parent container (div-block)
			return [
				'widget_type' => 'e-paragraph', // Always paragraph, never div-block
				'element_id' => $element_id,
				'original_tag' => $tag,
				'settings' => [
					'paragraph' => $full_text_content,
				],
				'attributes' => $element['attributes'],
				'inline_css' => $element['inline_css'] ?? [],
				'children' => $child_widgets, // Child widgets will be flattened by parent
				'flatten_children' => true, // Flag to indicate children should be flattened
			];
		}

		// If no children, handle as regular paragraph
		
		$settings = [
			'paragraph' => $content,
		];

		return [
			'widget_type' => 'e-paragraph',
			'element_id' => $element_id,
			'original_tag' => $tag, // Preserve original tag (p, blockquote, etc.)
			'settings' => $settings,
			'attributes' => $element['attributes'],
			'inline_css' => $element['inline_css'] ?? [],
			'children' => [], // No children for text-only paragraphs
		];
	}

	private function handle_div_block( $element ) {
		// DEBUG: Log entry into handle_div_block
		$children_count = count( $element['children'] ?? [] );
		error_log( "🔍 WIDGET_MAPPER DEBUG: handle_div_block called with {$children_count} children" );
		
		$element_id = $this->generate_element_id( $element );

		// OPTIMIZATION: If this div only contains text content (after text wrapping),
		// convert it directly to a paragraph widget to avoid unnecessary nesting
		$should_convert = $this->should_convert_div_to_paragraph( $element );
		error_log( "🔍 WIDGET_MAPPER DEBUG: should_convert_div_to_paragraph = " . ( $should_convert ? 'true' : 'false' ) );
		
		if ( $should_convert ) {
			error_log( "🔍 WIDGET_MAPPER DEBUG: Converting div to paragraph widget (early return)" );
			return $this->convert_div_to_paragraph_widget( $element );
		}
		
		error_log( "🔍 WIDGET_MAPPER DEBUG: Proceeding with normal div-block processing" );

		// Map children recursively and handle flattening
		$children = [];
		if ( ! empty( $element['children'] ) ) {
			// DEBUG: Log children before mapping
			error_log( "🔍 WIDGET_MAPPER DEBUG: handle_div_block processing " . count( $element['children'] ) . " children" );
			foreach ( $element['children'] as $child_index => $child ) {
				$child_tag = $child['tag'] ?? 'unknown';
				$child_class = $child['attributes']['class'] ?? '';
				error_log( "🔍 WIDGET_MAPPER DEBUG:   Child #{$child_index} - Tag: {$child_tag}, Class: '{$child_class}'" );
			}
			
			$mapped_children = $this->map_elements( $element['children'] );
			
			// DEBUG: Log mapped children
			error_log( "🔍 WIDGET_MAPPER DEBUG: handle_div_block mapped " . count( $mapped_children ) . " children" );
			foreach ( $mapped_children as $child_index => $child_widget ) {
				$child_type = $child_widget['widget_type'] ?? 'unknown';
				$child_class = $child_widget['attributes']['class'] ?? '';
				error_log( "🔍 WIDGET_MAPPER DEBUG:   Mapped Child #{$child_index} - Type: {$child_type}, Class: '{$child_class}'" );
			}
			
			// CRITICAL FIX: Flatten children to prevent double nesting
			foreach ( $mapped_children as $child_widget ) {
				$child_type = $child_widget['widget_type'] ?? 'unknown';
				$child_element_id = $child_widget['element_id'] ?? 'no-id';
				
				
				// If child widget has flatten_children flag, add its children as siblings
				if ( ! empty( $child_widget['flatten_children'] ) && ! empty( $child_widget['children'] ) ) {
					
					// Add the main widget (without its children)
					$flattened_widget = $child_widget;
					unset( $flattened_widget['children'] );
					unset( $flattened_widget['flatten_children'] );
					$children[] = $flattened_widget;
					
					// Add its children as siblings
					foreach ( $child_widget['children'] as $grandchild ) {
						$children[] = $grandchild;
					}
				} else {
					// Add widget normally
					$children[] = $child_widget;
				}
			}
			
		}

		// Check if this div has text content that should be wrapped in a paragraph
		// Note: We always keep the div as e-div-block to preserve styling capabilities
		// and put text content in an unstyled e-paragraph child to avoid validation errors
		if ( ! empty( $element['content'] ) && $this->should_wrap_text_in_paragraph( $element ) ) {
			$paragraph_widget = $this->create_paragraph_widget_for_text( $element['content'] );
			// Add the paragraph widget as the first child
			array_unshift( $children, $paragraph_widget );
		}

		// Only add settings that differ from defaults
		$settings = [];

		// e-div-block defaults to 'div', so only add tag if it's different
		if ( 'div' !== $element['tag'] ) {
			$settings['tag'] = $element['tag'];
		}

		return [
			'widget_type' => 'e-div-block',
			'element_id' => $element_id,
			'original_tag' => $element['tag'],
			'settings' => $settings,
			'attributes' => $element['attributes'],
			'inline_css' => $element['inline_css'] ?? [], // Styling stays on the div
			'children' => $children,
		];
	}

	private function handle_flexbox( $element ) {
		$element_id = $this->generate_element_id( $element );

		// Map children recursively
		$children = [];
		if ( ! empty( $element['children'] ) ) {
			$children = $this->map_elements( $element['children'] );
		}

		// Determine flexbox direction from CSS or default to column
		$direction = $this->determine_flex_direction( $element );

		return [
			'widget_type' => 'e-flexbox',
			'element_id' => $element_id,
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
		$element_id = $this->generate_element_id( $element );

		return [
			'widget_type' => 'e-link',
			'element_id' => $element_id,
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
		$element_id = $this->generate_element_id( $element );

		return [
			'widget_type' => 'e-button',
			'element_id' => $element_id,
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
		$element_id = $this->generate_element_id( $element );

		return [
			'widget_type' => 'e-image',
			'element_id' => $element_id,
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

	private function should_convert_div_to_paragraph( $element ) {
		// IMPORTANT: Always maintain e-div-block container structure for Elementor compatibility
		// Only consolidate synthetic paragraphs WITHIN the div-block, never eliminate the container entirely
		//
		// Convert to paragraph ONLY if:
		// 1. The element has only a synthetic paragraph child created by HTML parser
		// 2. AND we want to consolidate the synthetic paragraph content into the parent div-block's paragraph widget
		// 
		// NOTE: We should NOT convert text-only divs to direct paragraphs as this breaks Elementor structure

		$element_id = $element['attributes']['id'] ?? 'no-id';
		$element_class = $element['attributes']['class'] ?? 'no-class';
		$text_content = trim( $element['content'] ?? '' );
		$has_children = ! empty( $element['children'] );


		// CRITICAL FIX: Never convert divs to direct paragraphs - always maintain e-div-block structure
		// Only consolidate synthetic paragraphs within the div-block container
		
		// Check if we can consolidate synthetic paragraph children within the div-block
		if ( $has_children && 1 === count( $element['children'] ) ) {
			$only_child = $element['children'][0];
			
			// Check if it's a synthetic paragraph that can be consolidated
			// CRITICAL FIX: Don't consolidate paragraphs with class attributes - they're meaningful!
			$has_class_attributes = ! empty( $only_child['attributes']['class'] );
			$is_synthetic = ( 'p' === $only_child['tag'] &&
				empty( $only_child['children'] ) &&
				empty( $only_child['inline_css'] ) &&
				! $has_class_attributes ) ||  // Don't consolidate if it has class attributes
				! empty( $only_child['synthetic'] );
				
			// DEBUG: Log synthetic detection logic
			error_log( "🔍 WIDGET_MAPPER DEBUG: Child p tag has class: " . ( $has_class_attributes ? 'YES' : 'NO' ) );
			error_log( "🔍 WIDGET_MAPPER DEBUG: Child class attribute: '" . ( $only_child['attributes']['class'] ?? '' ) . "'" );
			error_log( "🔍 WIDGET_MAPPER DEBUG: is_synthetic = " . ( $is_synthetic ? 'true' : 'false' ) );
				
			if ( $is_synthetic ) {

				return true;
			}
		}

		// Always keep the div-block structure - no direct paragraph conversion
		return false;
	}

	private function convert_div_to_paragraph_widget( $element ) {
		// CRITICAL FIX: Always create e-div-block container with paragraph child
		// Never create direct paragraph widgets - maintain proper Elementor structure
		
		$element_id = $this->generate_element_id( $element );

		// Determine the text content to use from synthetic paragraph children
		$paragraph_content = trim( $element['content'] );

		// If element has paragraph children, consolidate their content
		if ( ! empty( $element['children'] ) ) {
			// Handle single paragraph child (existing logic)
			if ( 1 === count( $element['children'] ) ) {
				$only_child = $element['children'][0];
				if ( 'p' === $only_child['tag'] ) {
					// Use child's content if available, otherwise use parent's content
					$child_content = trim( $only_child['content'] ?? '' );
					if ( ! empty( $child_content ) ) {
						$paragraph_content = $child_content;
					}
				}
			}
			// Handle multiple paragraph children (new logic for synthetic paragraphs)
			else {
				$content_parts = [];
				foreach ( $element['children'] as $child ) {
					if ( 'p' === $child['tag'] && ! empty( $child['content'] ) ) {
						$content_parts[] = trim( $child['content'] );
					}
				}
				
				if ( ! empty( $content_parts ) ) {
					$paragraph_content = implode( ' ', $content_parts );
				}
			}
		}

		// Create paragraph widget as child of the e-div-block
		$paragraph_widget = [
			'widget_type' => 'e-paragraph',
			'element_id' => $element_id . '-paragraph',
			'original_tag' => 'p',
			'settings' => [
				'paragraph' => $paragraph_content,
			],
			'attributes' => [], // Clean paragraph widget
			'inline_css' => [],
			'children' => [],
		];

		// Return e-div-block container with paragraph child - maintaining proper Elementor structure
		return [
			'widget_type' => 'e-div-block',
			'element_id' => $element_id,
			'original_tag' => $element['tag'], // Preserve original tag for reference
			'settings' => [
				'tag' => $element['tag'] !== 'div' ? $element['tag'] : null, // Only set if not default div
			],
			'attributes' => $element['attributes'] ?? [], // Preserve all attributes (id, class, etc.)
			'inline_css' => $element['inline_css'] ?? [], // Preserve all inline CSS
			'children' => [ $paragraph_widget ], // Contains the paragraph widget
		];
	}

	private function should_wrap_text_in_paragraph( $element ) {
		// Determines if text content in a div should be automatically wrapped in an e-paragraph widget
		// This improves semantic structure and accessibility for text content in divs
		//
		// Only wrap text if:
		// 1. The element has meaningful text content (not just whitespace)
		// 2. The element doesn't already contain paragraph-like children (h1-h6, p, blockquote)

		$text_content = trim( $element['content'] ?? '' );

		if ( empty( $text_content ) ) {
			return false;
		}

		// Check if any children are already text-based widgets or contain text content
		if ( ! empty( $element['children'] ) ) {
			foreach ( $element['children'] as $child ) {
				$child_tag = $child['tag'] ?? '';

				// If there are already heading or paragraph elements, don't wrap the text
				// This prevents duplicate paragraph creation after HTML preprocessing
				if ( in_array( $child_tag, [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'blockquote' ], true ) ) {
					return false;
				}
			}
		}

		return true;
	}

	private function create_paragraph_widget_for_text( $text_content ) {
		// Creates a synthetic e-paragraph widget for text content found in div elements
		// This ensures text content is properly structured and accessible
		return [
			'widget_type' => 'e-paragraph',
			'original_tag' => 'p', // Synthetic paragraph
			'settings' => [
				'paragraph' => trim( $text_content ),
			],
			'attributes' => [], // No attributes for synthetic paragraphs
			'inline_css' => [], // No inline CSS for synthetic paragraphs
			'children' => [], // Paragraphs don't have children
		];
	}

	private function extract_text_from_children( $children ) {
		$text = '';
		foreach ( $children as $child ) {
			$text .= ' ' . ( $child['content'] ?? '' );
		}
		return trim( $text );
	}

	private function determine_flex_direction( $element ) {
		// Check inline CSS for flex-direction
		if ( ! empty( $element['inline_css']['flex-direction'] ) ) {
			return $element['inline_css']['flex-direction']['value'];
		}

		// Check for display: flex and other flex properties
		if ( ! empty( $element['inline_css']['display'] ) &&
			'flex' === $element['inline_css']['display']['value'] ) {
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
			++$stats['total_elements'];

			$tag = $element['tag'];
			if ( $this->is_supported( $tag ) ) {
				++$stats['supported_elements'];
				$widget_type = $this->get_widget_type_for_tag( $tag );
				$stats['widget_types'][ $widget_type ] = ( $stats['widget_types'][ $widget_type ] ?? 0 ) + 1;
			} else {
				++$stats['unsupported_elements'];
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
