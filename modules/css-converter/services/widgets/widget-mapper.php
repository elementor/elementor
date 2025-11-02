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

	public function map_elements( $elements, $is_top_level = true ) {
		$mapped_elements = [];

		foreach ( $elements as $element ) {
			$mapped = $this->map_element( $element );
			if ( $mapped ) {
				// Handle flattened groups (e.g., from paragraph with children)
				if ( isset( $mapped['widget_type'] ) && 'flattened_group' === $mapped['widget_type'] ) {
					// Add all widgets from the flattened group as siblings
					foreach ( $mapped['widgets'] as $flattened_widget ) {
						$mapped_elements[] = $flattened_widget;
					}
				} else {
					$mapped_elements[] = $mapped;
				}

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

		if ( $is_top_level ) {
			$mapped_elements = $this->ensure_container_wrapper( $mapped_elements );
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
		$level = (int) substr( $tag, 1 );
		$content = $element['content'] ?? '';
		$decoded_content = $this->decode_unicode_sequences( $content );
		$element_id = $this->generate_element_id( $element );

		return [
			'widget_type' => 'e-heading',
			'element_id' => $element_id,
			'original_tag' => $tag,
			'settings' => [
				'text' => $decoded_content,
				'tag' => $tag,
				'level' => $level,
			],
			'attributes' => $element['attributes'],
			'inline_css' => $element['inline_css'] ?? [],
			'children' => [],
		];
	}

	private function handle_paragraph( $element ) {
		$content = $element['content'] ?? '';
		$tag = $element['tag'];
		$element_id = $this->generate_element_id( $element );

		if ( ! empty( $element['children'] ) ) {
			$widgets = [];
			$text_only_children = [ 'span', 'strong', 'em', 'b', 'i', 'u', 'small', 'mark', 'del', 'ins', 'sub', 'sup' ];
			$children_to_keep = [];
			$text_parts = [];

			$text_parts[] = $this->extract_text_content_excluding_children( $element );

			foreach ( $element['children'] as $child ) {
				$child_tag = $child['tag'] ?? '';
				if ( in_array( $child_tag, $text_only_children, true ) ) {
					$child_text = $this->extract_all_text_recursively( $child );
					if ( ! empty( trim( $child_text ) ) ) {
						$text_parts[] = trim( $child_text );
					}
				} else {
					$children_to_keep[] = $child;
				}
			}

			$paragraph_text = implode( ' ', array_filter( $text_parts, function( $part ) {
				return ! empty( trim( $part ) );
			} ) );

			$decoded_paragraph_text = $this->decode_unicode_sequences( trim( $paragraph_text ) );

			$widgets[] = [
				'widget_type' => 'e-paragraph',
				'element_id' => $element_id,
				'original_tag' => $tag,
				'settings' => [
					'paragraph' => $decoded_paragraph_text,
				],
				'attributes' => $element['attributes'],
				'inline_css' => $element['inline_css'] ?? [],
				'children' => [],
			];

			if ( ! empty( $children_to_keep ) ) {
				$child_widgets = $this->map_elements( $children_to_keep, false );
				$widgets = array_merge( $widgets, $child_widgets );
			}

			return [
				'widget_type' => 'flattened_group',
				'widgets' => $widgets,
			];
		}

		$decoded_content = $this->decode_unicode_sequences( $content );

		$settings = [
			'paragraph' => $decoded_content,
		];

		return [
			'widget_type' => 'e-paragraph',
			'element_id' => $element_id,
			'original_tag' => $tag,
			'settings' => $settings,
			'attributes' => $element['attributes'],
			'inline_css' => $element['inline_css'] ?? [],
			'children' => [],
		];
	}

	private function handle_div_block( $element ) {
		// DEBUG: Log entry into handle_div_block
		$children_count = count( $element['children'] ?? [] );

		$element_id = $this->generate_element_id( $element );

		// OPTIMIZATION: If this div only contains text content (after text wrapping),
		// convert it directly to a paragraph widget to avoid unnecessary nesting
		$should_convert = $this->should_convert_div_to_paragraph( $element );

		if ( $should_convert ) {
			return $this->convert_div_to_paragraph_widget( $element );
		}

		// Map children recursively and handle flattening
		$children = [];
		if ( ! empty( $element['children'] ) ) {
			// DEBUG: Log children before mapping
			foreach ( $element['children'] as $child_index => $child ) {
				$child_tag = $child['tag'] ?? 'unknown';
				$child_class = $child['attributes']['class'] ?? '';
			}

			// Filter out children that are already Elementor widgets/containers
			$filtered_children = array_filter( $element['children'], function( $child ) {
				return ! $this->is_elementor_widget_or_container( $child );
			} );

			$mapped_children = $this->map_elements( $filtered_children, false );

			// DEBUG: Log mapped children
			foreach ( $mapped_children as $child_index => $child_widget ) {
				$child_type = $child_widget['widget_type'] ?? 'unknown';
				$child_class = $child_widget['attributes']['class'] ?? '';
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
			$children = $this->map_elements( $element['children'], false );
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
		$content = $element['content'] ?? '';
		$decoded_content = $this->decode_unicode_sequences( $content );
		$element_id = $this->generate_element_id( $element );

		return [
			'widget_type' => 'e-link',
			'element_id' => $element_id,
			'original_tag' => 'a',
			'settings' => [
				'text' => $decoded_content,
				'url' => $href,
				'target' => $target,
			],
			'attributes' => $element['attributes'],
			'inline_css' => $element['inline_css'] ?? [],
			'children' => [],
		];
	}

	private function handle_button( $element ) {
		$type = $element['attributes']['type'] ?? 'button';
		$content = $element['content'] ?? '';
		$decoded_content = $this->decode_unicode_sequences( $content );
		$element_id = $this->generate_element_id( $element );

		return [
			'widget_type' => 'e-button',
			'element_id' => $element_id,
			'original_tag' => 'button',
			'settings' => [
				'text' => $decoded_content,
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
				! $has_class_attributes ) || // Don't consolidate if it has class attributes
				! empty( $only_child['synthetic'] );

			// DEBUG: Log synthetic detection logic

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

		$decoded_paragraph_content = $this->decode_unicode_sequences( $paragraph_content );

		// Create paragraph widget as child of the e-div-block
		$paragraph_widget = [
			'widget_type' => 'e-paragraph',
			'element_id' => $element_id . '-paragraph',
			'original_tag' => 'p',
			'settings' => [
				'paragraph' => $decoded_paragraph_content,
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

	private function ensure_container_wrapper( $widgets ) {
		// If there's only one widget and it's already a container, return as-is
		if ( 1 === count( $widgets ) && 'e-div-block' === $widgets[0]['widget_type'] ) {
			return $widgets;
		}

		// If there are multiple widgets or non-container widgets, wrap them in a container
		if ( count( $widgets ) > 1 || ! $this->is_container_widget( $widgets[0]['widget_type'] ?? '' ) ) {
			$container_id = $this->generate_container_id();

			return [
				[
					'widget_type' => 'e-div-block',
					'element_id' => $container_id,
					'original_tag' => 'div',
					'settings' => [],
					'attributes' => [],
					'inline_css' => [],
					'children' => $widgets,
				],
			];
		}

		return $widgets;
	}

	private function is_container_widget( $widget_type ) {
		return in_array( $widget_type, [ 'e-div-block', 'e-flexbox' ], true );
	}

	private function generate_container_id() {
		return 'container-' . wp_generate_uuid4();
	}

	private function create_paragraph_widget_for_text( $text_content ) {
		$decoded_text = $this->decode_unicode_sequences( trim( $text_content ) );
		
		return [
			'widget_type' => 'e-paragraph',
			'original_tag' => 'p',
			'settings' => [
				'paragraph' => $decoded_text,
			],
			'attributes' => [],
			'inline_css' => [],
			'children' => [],
		];
	}

	private function extract_text_content_excluding_children( $element ) {
		$full_content = $element['content'] ?? '';

		if ( empty( $element['children'] ) ) {
			return $this->decode_unicode_sequences( trim( $full_content ) );
		}

		foreach ( $element['children'] as $child ) {
			$child_content = $child['content'] ?? '';
			if ( ! empty( $child_content ) ) {
				$full_content = str_replace( $child_content, '', $full_content );
			}
		}

		return $this->decode_unicode_sequences( trim( $full_content ) );
	}

	private function extract_text_from_children( $children ) {
		$text = '';
		foreach ( $children as $child ) {
			$text .= ' ' . ( $child['content'] ?? '' );
		}
		return trim( $text );
	}

	private function extract_all_text_recursively( $element ) {
		$text_parts = [];
		
		if ( ! empty( $element['content'] ) ) {
			$decoded_content = $this->decode_unicode_sequences( trim( $element['content'] ) );
			$text_parts[] = $decoded_content;
		}
		
		if ( ! empty( $element['children'] ) ) {
			foreach ( $element['children'] as $child ) {
				$child_text = $this->extract_all_text_recursively( $child );
				if ( ! empty( trim( $child_text ) ) ) {
					$text_parts[] = trim( $child_text );
				}
			}
		}
		
		$combined_text = implode( ' ', array_filter( $text_parts, function( $part ) {
			return ! empty( trim( $part ) );
		} ) );
		
		return $this->decode_unicode_sequences( $combined_text );
	}

	private function decode_unicode_sequences( $text ) {
		return preg_replace_callback(
			'/u([0-9A-Fa-f]{4})/',
			function( $matches ) {
				$unicode_code = hexdec( $matches[1] );
				if ( function_exists( 'mb_chr' ) ) {
					return mb_chr( $unicode_code, 'UTF-8' );
				}
				if ( class_exists( 'IntlChar' ) && method_exists( 'IntlChar', 'chr' ) ) {
					return \IntlChar::chr( $unicode_code );
				}
				$hex_code = strtoupper( $matches[1] );
				return json_decode( '"\\u' . $hex_code . '"' );
			},
			$text
		);
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

	private function is_elementor_widget_or_container( $element ): bool {
		$class_string = $element['attributes']['class'] ?? '';
		
		if ( empty( $class_string ) ) {
			return false;
		}
		
		$elementor_patterns = [
			'elementor-widget',
			'elementor-element',
			'e-con',
			'elementor-section',
			'elementor-column',
			'elementor-container',
		];
		
		foreach ( $elementor_patterns as $pattern ) {
			if ( strpos( $class_string, $pattern ) !== false ) {
				return true;
			}
		}
		
		return false;
	}
}
