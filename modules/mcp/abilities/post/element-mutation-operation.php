<?php

namespace Elementor\Modules\Mcp\Abilities\Post;

use Elementor\Modules\Mcp\Abilities\Services\Element_Spec_Resolver;
use Elementor\Modules\Mcp\Abilities\Services\Element_Style_Patcher;
use Elementor\Modules\Mcp\Abilities\Services\Element_Tree;
use Elementor\Modules\Mcp\Abilities\Services\Post_Context;
use Elementor\Modules\Mcp\Abilities\Services\Post_Response;
use Elementor\Modules\Mcp\Abilities\Services\Svg_Uploader;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Element-scoped operations: `update_element`, `add_classes`, `remove_classes`.
 *
 * Mirrors {@see Content_Mutation_Operation} — single class, mode-via-constructor.
 *
 * All three modes share the same outer flow:
 *  1. Load editable document (covers permissions, invalid post id, not-elementor).
 *  2. Require `element_id` (string, non-empty).
 *  3. Load the saved tree, locate the target node by id (404 if missing).
 *  4. Per-mode mutation (returns the patched node + unconverted-css + optional WP_Error).
 *  5. Save the whole tree.
 *  6. Re-read the saved tree and build the response from the authoritative shape.
 *
 * The response envelope includes the full `patched_element` AND a structured
 * delta summary (`changed_settings_keys`, `style_id` for css patches, `classes`
 * for the class ops) so the JS handler can dispatch the matching legacy v1
 * commands without parsing the node.
 */
class Element_Mutation_Operation extends Post_Operation {

	private const VALID_MODES = [ 'update', 'add_classes', 'remove_classes' ];

	private string $mode;

	public function __construct( string $mode ) {
		if ( ! in_array( $mode, self::VALID_MODES, true ) ) {
			throw new \InvalidArgumentException( 'Invalid element mutation mode: ' . esc_html( $mode ) );
		}

		$this->mode = $mode;
	}

	public function handle( array $input ) {
		$document = Post_Context::get_editable_document( $input );
		if ( is_wp_error( $document ) ) {
			return $document;
		}

		$element_id = $this->require_element_id( $input );
		if ( is_wp_error( $element_id ) ) {
			return $element_id;
		}

		$tree = $document->get_elements_data();
		$tree = is_array( $tree ) ? $tree : [];

		[ $node, $path ] = Element_Tree::find_by_id( $tree, $element_id );

		if ( null === $node ) {
			return new \WP_Error(
				'element_not_found',
				sprintf(
					/* translators: 1: element id, 2: post id. */
					__( 'Element "%1$s" does not exist in post %2$d.', 'elementor' ),
					$element_id,
					$document->get_main_id()
				),
				[ 'status' => \WP_Http::NOT_FOUND ]
			);
		}

		switch ( $this->mode ) {
			case 'update':
				$result = $this->apply_update( $node, $input );
				break;
			case 'add_classes':
				$result = $this->apply_add_classes( $node, $input );
				break;
			case 'remove_classes':
				$result = $this->apply_remove_classes( $node, $input );
				break;
			default:
				return new \WP_Error( 'invalid_operation', 'Unsupported mode.' );
		}

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		[ $patched_node, $unconverted_css, $deltas ] = $result;

		$new_tree = Element_Tree::replace_at_path( $tree, $path, $patched_node );

		$saved = $document->save( [ 'elements' => $new_tree ] );
		if ( ! $saved ) {
			return new \WP_Error(
				'save_failed',
				__( 'Could not save document elements.', 'elementor' ),
				[ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ]
			);
		}

		$authoritative_node = $this->reread_node( $document, $element_id, $patched_node );

		$envelope = Post_Response::envelope(
			$this->operation_name(),
			$document->get_main_id(),
			array_merge( [ 'element_id' => $element_id ], $deltas )
		);

		$envelope = Post_Response::with_patched_element( $envelope, $authoritative_node );

		return Post_Response::with_unconverted_css( $envelope, $unconverted_css );
	}

	private function operation_name(): string {
		switch ( $this->mode ) {
			case 'update':
				return 'update_element';
			case 'add_classes':
				return 'add_classes';
			case 'remove_classes':
				return 'remove_classes';
		}

		return $this->mode;
	}

	private function require_element_id( array $input ) {
		$element_id = isset( $input['element_id'] ) && is_string( $input['element_id'] ) ? trim( $input['element_id'] ) : '';

		if ( '' === $element_id ) {
			return new \WP_Error(
				'missing_field',
				__( 'element_id (non-empty string) is required for element-scoped operations.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		return $element_id;
	}

	/**
	 * @return array{0: array, 1: array, 2: array}|\WP_Error [ patched_node, unconverted_css, deltas ]
	 */
	private function apply_update( array $node, array $input ) {
		$patch = isset( $input['patch'] ) && is_array( $input['patch'] ) ? $input['patch'] : null;

		if ( null === $patch || empty( $patch ) ) {
			return new \WP_Error(
				'invalid_patch',
				__( 'patch (non-empty object) is required for update_element.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		$widget_type = $this->resolve_widget_type( $node );

		$changed_settings_keys = $this->apply_settings_patch( $node, $patch, $widget_type );

		$style_id = null;
		$unconverted_css = [];

		$css_input = $patch['css'] ?? null;
		if ( null !== $css_input ) {
			$css_string = Element_Spec_Resolver::normalize_css( $css_input );
			if ( null !== $css_string ) {
				$unconverted_css = Element_Style_Patcher::merge_into_local( $node, $css_string );
				$style_id = 'e-' . $node['id'] . '-s';
				// Element_Style_Patcher mirrors style_id into settings.classes; record that too.
				if ( ! in_array( 'classes', $changed_settings_keys, true ) ) {
					$changed_settings_keys[] = 'classes';
				}
			}
		}

		$deltas = [
			'changed_settings_keys' => array_values( array_unique( $changed_settings_keys ) ),
		];

		if ( null !== $style_id ) {
			$deltas['style_id'] = $style_id;
		}

		return [ $node, $unconverted_css, $deltas ];
	}

	/**
	 * @return array<int, string> Keys touched in `$node['settings']`.
	 */
	private function apply_settings_patch( array &$node, array $patch, string $widget_type ): array {
		if ( ! isset( $node['settings'] ) || ! is_array( $node['settings'] ) ) {
			$node['settings'] = [];
		}

		$changed = [];

		// classes (replace semantics — distinct from add_classes / remove_classes ops)
		if ( array_key_exists( 'classes', $patch ) && is_array( $patch['classes'] ) ) {
			$classes = array_values( array_filter( $patch['classes'], 'is_string' ) );
			$node['settings']['classes'] = [
				'$$type' => 'classes',
				'value' => $classes,
			];
			$changed[] = 'classes';
		}

		$text = isset( $patch['text'] ) && is_string( $patch['text'] ) ? $patch['text'] : null;
		$tag = $patch['tag'] ?? null;

		switch ( $widget_type ) {
			case 'e-heading':
				if ( null !== $text ) {
					$node['settings']['title'] = Element_Spec_Resolver::html_v3_envelope( $text );
					$changed[] = 'title';
				}
				if ( null !== $tag ) {
					$node['settings']['tag'] = [
						'$$type' => 'string',
						'value' => Element_Spec_Resolver::normalize_heading_tag( $tag ),
					];
					$changed[] = 'tag';
				}
				break;

			case 'e-paragraph':
				if ( null !== $text ) {
					$node['settings']['paragraph'] = Element_Spec_Resolver::html_v3_envelope( $text );
					$changed[] = 'paragraph';
				}
				if ( is_string( $tag ) && '' !== $tag ) {
					$node['settings']['tag'] = [
						'$$type' => 'string',
						'value' => $tag,
					];
					$changed[] = 'tag';
				}
				break;

			case 'e-button':
				if ( null !== $text ) {
					$node['settings']['text'] = Element_Spec_Resolver::html_v3_envelope( $text );
					$changed[] = 'text';
				}
				if ( array_key_exists( 'url', $patch ) ) {
					$url = Element_Spec_Resolver::sanitize_button_url( $patch['url'] );
					if ( null !== $url ) {
						$node['settings']['link'] = [
							'$$type' => 'link',
							'value' => [
								'destination' => [
									'$$type' => 'url',
									'value' => $url,
								],
								'isTargetBlank' => [
									'$$type' => 'boolean',
									'value' => ! empty( $patch['target_blank'] ),
								],
							],
						];
						$changed[] = 'link';
					}
				}
				if ( is_string( $tag ) && '' !== $tag ) {
					$node['settings']['tag'] = [
						'$$type' => 'string',
						'value' => $tag,
					];
					$changed[] = 'tag';
				}
				break;

			case 'e-svg':
				$svg_value = $this->build_svg_patch_value( $patch );
				if ( null !== $svg_value ) {
					$node['settings']['svg'] = [
						'$$type' => 'svg-src',
						'value' => $svg_value,
					];
					$changed[] = 'svg';
				}
				if ( array_key_exists( 'link_url', $patch ) ) {
					$url = Element_Spec_Resolver::sanitize_button_url( $patch['link_url'] );
					if ( null !== $url ) {
						$node['settings']['link'] = [
							'$$type' => 'link',
							'value' => [
								'destination' => [
									'$$type' => 'url',
									'value' => $url,
								],
								'isTargetBlank' => [
									'$$type' => 'boolean',
									'value' => ! empty( $patch['link_target_blank'] ),
								],
							],
						];
						$changed[] = 'link';
					}
				}
				break;

			default:
				// Containers and unknown widget types: only `tag` is applied.
				if ( is_string( $tag ) && '' !== $tag ) {
					$node['settings']['tag'] = [
						'$$type' => 'string',
						'value' => $tag,
					];
					$changed[] = 'tag';
				}
				break;
		}

		return $changed;
	}

	/**
	 * Build a `svg-src` value from patch fields, or null when no source key is present
	 * (so the existing source is left untouched). Precedence mirrors the create path:
	 * svg_id → svg_url → svg_markup (sanitized + sideloaded into the media library).
	 *
	 * @return array{id: ?array, url: ?array}|null
	 */
	private function build_svg_patch_value( array $patch ): ?array {
		if ( isset( $patch['svg_id'] ) && is_numeric( $patch['svg_id'] ) && (int) $patch['svg_id'] > 0 ) {
			return [
				'id' => [ '$$type' => 'image-attachment-id', 'value' => (int) $patch['svg_id'] ],
				'url' => null,
			];
		}

		if ( isset( $patch['svg_url'] ) && is_string( $patch['svg_url'] ) ) {
			$url = esc_url_raw( trim( $patch['svg_url'] ), [ 'http', 'https' ] );
			if ( '' !== $url ) {
				return [
					'id' => null,
					'url' => [ '$$type' => 'url', 'value' => $url ],
				];
			}
		}

		if ( isset( $patch['svg_markup'] ) && is_string( $patch['svg_markup'] ) && '' !== trim( $patch['svg_markup'] ) ) {
			$attachment_id = Svg_Uploader::make()->upload_inline( $patch['svg_markup'] );
			if ( null !== $attachment_id ) {
				return [
					'id' => [ '$$type' => 'image-attachment-id', 'value' => $attachment_id ],
					'url' => null,
				];
			}
		}

		return null;
	}

	private function resolve_widget_type( array $node ): string {
		$el_type = isset( $node['elType'] ) && is_string( $node['elType'] ) ? $node['elType'] : '';

		if ( 'widget' === $el_type && isset( $node['widgetType'] ) && is_string( $node['widgetType'] ) ) {
			return $node['widgetType'];
		}

		return $el_type;
	}

	/**
	 * @return array{0: array, 1: array, 2: array}|\WP_Error
	 */
	private function apply_add_classes( array $node, array $input ) {
		$new = $this->require_classes_input( $input );
		if ( is_wp_error( $new ) ) {
			return $new;
		}

		$existing = $this->read_classes( $node );
		$result = array_values( array_unique( array_merge( $existing, $new ) ) );

		$this->write_classes( $node, $result );

		return [ $node, [], [ 'classes' => $result ] ];
	}

	/**
	 * @return array{0: array, 1: array, 2: array}|\WP_Error
	 */
	private function apply_remove_classes( array $node, array $input ) {
		$to_remove = $this->require_classes_input( $input );
		if ( is_wp_error( $to_remove ) ) {
			return $to_remove;
		}

		$existing = $this->read_classes( $node );
		$style_id = isset( $node['id'] ) && is_string( $node['id'] ) ? 'e-' . $node['id'] . '-s' : '';

		$result = array_values(
			array_filter(
				$existing,
				static function ( $class ) use ( $to_remove, $style_id ) {
					if ( $style_id !== '' && $class === $style_id ) {
						return true; // local-style class is always preserved
					}
					return ! in_array( $class, $to_remove, true );
				}
			)
		);

		$this->write_classes( $node, $result );

		return [ $node, [], [ 'classes' => $result ] ];
	}

	/**
	 * @return array<int, string>|\WP_Error
	 */
	private function require_classes_input( array $input ) {
		if ( ! isset( $input['classes'] ) || ! is_array( $input['classes'] ) || empty( $input['classes'] ) ) {
			return new \WP_Error(
				'invalid_classes',
				__( 'classes (non-empty array of strings) is required.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		$classes = array_values(
			array_filter(
				$input['classes'],
				static function ( $class ) {
					return is_string( $class ) && '' !== trim( $class );
				}
			)
		);

		if ( empty( $classes ) ) {
			return new \WP_Error(
				'invalid_classes',
				__( 'classes must be a non-empty array of strings.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		return $classes;
	}

	private function read_classes( array $node ): array {
		if (
			! isset( $node['settings']['classes']['value'] ) ||
			! is_array( $node['settings']['classes']['value'] )
		) {
			return [];
		}

		return array_values( array_filter( $node['settings']['classes']['value'], 'is_string' ) );
	}

	private function write_classes( array &$node, array $classes ): void {
		if ( ! isset( $node['settings'] ) || ! is_array( $node['settings'] ) ) {
			$node['settings'] = [];
		}

		$node['settings']['classes'] = [
			'$$type' => 'classes',
			'value' => $classes,
		];
	}

	private function reread_node( $document, string $element_id, array $fallback ): array {
		$saved_tree = $document->get_elements_data();
		if ( ! is_array( $saved_tree ) ) {
			return $fallback;
		}

		[ $node ] = Element_Tree::find_by_id( $saved_tree, $element_id );

		return is_array( $node ) ? $node : $fallback;
	}
}
