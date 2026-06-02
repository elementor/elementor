<?php

namespace Elementor\Modules\Mcp\Abilities\Post;

use Elementor\Modules\Mcp\Abilities\Services\Element_Spec_Resolver;
use Elementor\Modules\Mcp\Abilities\Services\Element_Style_Patcher;
use Elementor\Modules\Mcp\Abilities\Services\Element_Tree;
use Elementor\Modules\Mcp\Abilities\Services\Post_Context;
use Elementor\Modules\Mcp\Abilities\Services\Post_Response;
use Elementor\Modules\Mcp\Abilities\Services\Svg_Source_Resolver;

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

	private array $patch_warnings = [];

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

		[ $patched_node, $unconverted_css, $deltas, $warnings ] = $result;

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

		$envelope = Post_Response::with_unconverted_css( $envelope, $unconverted_css );

		return Post_Response::with_warnings( $envelope, $warnings );
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
	 * @return array{0: array, 1: array, 2: array, 3: array}|\WP_Error [ patched_node, unconverted_css, deltas, warnings ]
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

		$this->patch_warnings = [];

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

		$states_input = $patch['states'] ?? null;
		if ( null !== $states_input ) {
			$normalized_states = Element_Spec_Resolver::normalize_states( $states_input );

			foreach ( $normalized_states['warnings'] as $warning ) {
				$warning['path'] = 'patch.states';
				$this->patch_warnings[] = $warning;
			}

			foreach ( $normalized_states['states'] as $state => $state_css ) {
				$state_unconverted = Element_Style_Patcher::merge_into_local( $node, $state_css, $state );
				$unconverted_css = array_merge( $unconverted_css, $state_unconverted );
				$style_id = 'e-' . $node['id'] . '-s';
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

		return [ $node, $unconverted_css, $deltas, $this->patch_warnings ];
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
				$svg_resolver = Svg_Source_Resolver::make();
				$svg_value = $svg_resolver->resolve( $patch, 'patch' );
				foreach ( $svg_resolver->get_warnings() as $warning ) {
					$this->patch_warnings[] = $warning;
				}
				if ( null !== $svg_value ) {
					$node['settings']['svg'] = [
						'$$type' => 'svg-src',
						'value' => $svg_value,
					];
					$changed[] = 'svg';
				}
				$this->warn_legacy_link_keys_in_patch( $patch );
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
	 * On an svg patch, the link is set via link_url / link_target_blank; the legacy
	 * url / target_blank keys (still accepted on button patches) are ignored. Mirror
	 * the create-path warning so agents are told to rename.
	 */
	private function warn_legacy_link_keys_in_patch( array $patch ): void {
		$legacy = [];
		if ( array_key_exists( 'url', $patch ) ) {
			$legacy['url'] = 'link_url';
		}
		if ( array_key_exists( 'target_blank', $patch ) ) {
			$legacy['target_blank'] = 'link_target_blank';
		}
		if ( empty( $legacy ) ) {
			return;
		}

		$renames = [];
		foreach ( $legacy as $old => $new ) {
			$renames[] = $old . ' → ' . $new;
		}

		$this->patch_warnings[] = [
			'reason' => 'legacy_link_keys_ignored',
			'path' => 'patch',
			'keys' => array_keys( $legacy ),
			'hint' => 'Rename: ' . implode( ', ', $renames ) . '. On an svg element use link_url / link_target_blank; the legacy url / target_blank fields were ignored.',
		];
	}

	private function resolve_widget_type( array $node ): string {
		$el_type = isset( $node['elType'] ) && is_string( $node['elType'] ) ? $node['elType'] : '';

		if ( 'widget' === $el_type && isset( $node['widgetType'] ) && is_string( $node['widgetType'] ) ) {
			return $node['widgetType'];
		}

		return $el_type;
	}

	/**
	 * @return array{0: array, 1: array, 2: array, 3: array}|\WP_Error
	 */
	private function apply_add_classes( array $node, array $input ) {
		$new = $this->require_classes_input( $input );
		if ( is_wp_error( $new ) ) {
			return $new;
		}

		$existing = $this->read_classes( $node );
		$result = array_values( array_unique( array_merge( $existing, $new ) ) );

		$this->write_classes( $node, $result );

		return [ $node, [], [ 'classes' => $result ], [] ];
	}

	/**
	 * @return array{0: array, 1: array, 2: array, 3: array}|\WP_Error
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

		return [ $node, [], [ 'classes' => $result ], [] ];
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
