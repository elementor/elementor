<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\AtomicWidgets\PropsResolver\Render_Props_Resolver;
use Elementor\Modules\AtomicWidgets\Styles\Local_Style_Serializer;
use Elementor\Modules\AtomicWidgets\Utils\Element_Structure_Title;
use Elementor\Modules\DefaultStyles\Default_Styles_Repository;
use Elementor\Modules\GlobalClasses\Utils\Atomic_Elements_Utils;
use Elementor\Modules\Interactions\Props\Interaction_Item_Prop_Type;
use Elementor\Modules\Mcp\Abilities\Appliers\V3_Node_Bridge;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Non_Style_Allowlist;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Style_Serializer;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Widget_Bridge_Registry;
use Elementor\Modules\Mcp\Abilities\Utils\Element_Default_Styles_Builder;
use Elementor\Modules\Mcp\Abilities\Utils\Element_Tag_Resolver;
use Elementor\Modules\Mcp\Abilities\Utils\Widget_Context_Helper;
use Elementor\Plugin;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Get_Structure_Ability extends Abstract_Ability {

	private ?Default_Styles_Repository $default_styles_repository;

	public function __construct( ?Default_Styles_Repository $default_styles_repository = null ) {
		$this->default_styles_repository = $default_styles_repository;
	}

	protected function get_ability_id(): string {
		return 'elementor/get-page-structure';
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'Get Elementor Page Structure', 'elementor' ),
			__( 'Returns a lean Elementor element tree skeleton (id, elType, widgetType, version, title, nested elements) for a single post or page ID. Each node is tagged with version=3 (legacy) or version=4 (atomic). Only version=4 nodes can be modified via elementor/manage-elements or referenced by elementor/build-composition element_config; version=3 nodes are returned for context only and must be edited directly in the Elementor editor. Optionally scope to a subtree via element_id. Set include_content=true (requires element_id) to also return each V4 node\'s settings, styles (as { __style_id, css } where css is a raw CSS string round-trippable to manage-elements.update.style / build-composition.style in replace mode), interactions, its rendered HTML tag when known, and default_styles (a CSS map of the widget base_styles merged with the kit\'s site-wide default style for that tag — the effective styling before any inline/global overrides). V3 nodes are returned with empty settings and styles. Only works for posts that were saved with Elementor.', 'elementor' ),
			'elementor',
			[
				'type' => 'object',
				'properties' => [
					'elements' => [
						'type' => 'array',
						'description' => 'Skeleton of Elementor elements (id, elType, widgetType, version, title, nested elements). When include_content is true, V4 nodes also include settings, styles (as { __style_id, css } — raw CSS string with @media(--breakpoint) + &:hover/&:focus/&:active), interactions, tag (rendered HTML wrapper tag when known), and default_styles (widget base_styles merged with the kit\'s site-wide default style for that tag, as a CSS property map). V3 nodes always have empty settings and styles.',
					],
				],
			],
			[
				'annotations' => [
					'readonly' => true,
					'idempotent' => true,
					'destructive' => false,
				],
			],
			function () {
				return current_user_can( 'edit_posts' );
			},
			[
				'type' => 'object',
				'required' => [ 'post_id' ],
				'properties' => [
					'post_id' => [
						'type' => 'integer',
						'description' => 'WordPress post ID of the Elementor document.',
					],
					'element_id' => [
						'type' => 'string',
						'description' => 'Optional. If provided, returns only the subtree rooted at that element id.',
					],
					'include_content' => [
						'type' => 'boolean',
						'default' => false,
						'description' => 'If true, includes each V4 node\'s settings, styles (as { __style_id, css } — raw CSS string), interactions, rendered tag, and default_styles (widget base + kit site-wide default merged, as a CSS map). The styles.css value is round-trippable to build-composition.style / manage-elements.update.style in replace mode. Requires element_id.',
					],
				],
			]
		);
	}

	public function execute( $input = [] ) {
		$post_id = $this->resolve_post_id( $input );
		if ( is_wp_error( $post_id ) ) {
			return $post_id;
		}

		$document = $this->get_editable_document( $post_id );
		if ( is_wp_error( $document ) ) {
			return $document;
		}

		$elements = $document->get_elements_data();
		$elements = is_array( $elements ) ? $elements : [];

		$element_id = isset( $input['element_id'] ) ? (string) $input['element_id'] : '';
		$include_content = ! empty( $input['include_content'] );

		if ( $include_content && '' === $element_id ) {
			return new \WP_Error(
				'invalid_input',
				__( 'include_content requires element_id.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		if ( '' !== $element_id ) {
			$subtree = Utils::find_element_recursive( $elements, $element_id );

			if ( ! $subtree ) {
				return new \WP_Error(
					'element_not_found',
					__( 'Element not found in this document.', 'elementor' ),
					[ 'status' => \WP_Http::NOT_FOUND ]
				);
			}

			$elements = [ $subtree ];
		}

		return [
			'elements' => $this->prune_elements( $elements, $include_content ),
		];
	}

	private function prune_elements( array $elements, bool $include_content = false ): array {
		return Plugin::$instance->db->iterate_data( $elements, function ( $node ) use ( $include_content ) {
			$skeleton = [
				'id' => $node['id'] ?? null,
				'elType' => $node['elType'] ?? null,
			];

			if ( isset( $node['widgetType'] ) ) {
				$skeleton['widgetType'] = $node['widgetType'];
			}

			$title = Element_Structure_Title::resolve( $node );

			if ( null !== $title ) {
				$skeleton['title'] = $title;
			}

			if ( ! empty( $node['elements'] ) ) {
				$skeleton['elements'] = $node['elements'];
			}

			if ( $include_content ) {
				$this->populate_content( $skeleton, $node );
			}

			return $skeleton;
		} );
	}

	private function populate_content( array &$skeleton, array $node ): void {
		$skeleton['interactions'] = $this->normalize_interactions( $node['interactions'] ?? null );

		if ( V3_Node_Bridge::is_v3_node( $node ) ) {
			$this->populate_v3_content( $skeleton, $node );
			return;
		}

		$config = $this->resolve_widget_config( $node );
		$props_schema = $config['atomic_props_schema'] ?? null;
		$raw_settings = $node['settings'] ?? [];

		if ( ! $props_schema ) {
			$skeleton['settings'] = (object) [];
			$skeleton['styles'] = (object) [];
			return;
		}

		$resolved_settings = is_array( $raw_settings )
			? Render_Props_Resolver::for_settings()->resolve( array_intersect_key( $props_schema, $raw_settings ), $raw_settings )
			: $raw_settings;

		$skeleton['settings'] = $resolved_settings ? $resolved_settings : (object) [];
		$skeleton['styles'] = Local_Style_Serializer::serialize( $node['styles'] ?? [] );

		$this->populate_default_styles( $skeleton, $config, is_array( $resolved_settings ) ? $resolved_settings : [] );
	}

	private function populate_default_styles( array &$skeleton, array $config, array $resolved_settings ): void {
		$base_styles = is_array( $config['base_styles'] ?? null ) ? $config['base_styles'] : [];
		$props_schema = is_array( $config['atomic_props_schema'] ?? null ) ? $config['atomic_props_schema'] : [];
		$tag = Element_Tag_Resolver::resolve( $resolved_settings, $props_schema );

		$default_styles = Element_Default_Styles_Builder::build( $base_styles, $tag, $this->get_default_styles_repository() );

		if ( null !== $tag ) {
			$skeleton['tag'] = $tag;
		}

		if ( ! empty( $default_styles ) ) {
			$skeleton['default_styles'] = $default_styles;
		}
	}

	private function get_default_styles_repository(): ?Default_Styles_Repository {
		if ( null !== $this->default_styles_repository ) {
			return $this->default_styles_repository;
		}

		if ( ! class_exists( Default_Styles_Repository::class ) ) {
			return null;
		}

		$this->default_styles_repository = Default_Styles_Repository::make();

		return $this->default_styles_repository;
	}

	private function populate_v3_content( array &$skeleton, array $node ): void {
		$widget_type = (string) ( $node['widgetType'] ?? '' );
		$raw_settings = is_array( $node['settings'] ?? null ) ? $node['settings'] : [];

		$allowed = V3_Widget_Bridge_Registry::get_non_style_keys( $widget_type );

		if ( empty( $allowed ) && empty( V3_Widget_Bridge_Registry::get_style_overrides( $widget_type ) ) ) {
			$skeleton['settings'] = (object) [];
			$skeleton['style'] = '';
			return;
		}

		$filter = V3_Non_Style_Allowlist::filter( $widget_type, $raw_settings );
		$allowed_settings = $filter['allowed'];

		$widget_config = Widget_Context_Helper::get_widget_config( $widget_type );
		$style = ( new V3_Style_Serializer() )->serialize( $raw_settings, $widget_type, $widget_config ?? [] );

		$skeleton['settings'] = ! empty( $allowed_settings ) ? $allowed_settings : (object) [];
		$skeleton['style'] = $style;
	}

	private function normalize_interactions( $interactions ): array {
		if ( is_string( $interactions ) ) {
			$decoded = json_decode( $interactions, true );
			$interactions = ( JSON_ERROR_NONE === json_last_error() && is_array( $decoded ) ) ? $decoded : [];
		}

		if ( ! is_array( $interactions ) || empty( $interactions['items'] ) ) {
			return [];
		}

		$resolver = Render_Props_Resolver::for_plain();
		$prop_type = Interaction_Item_Prop_Type::make();
		$plain = [];

		foreach ( $interactions['items'] as $item ) {
			$serialized = $resolver->resolve_value( $item, $prop_type );

			if ( is_array( $serialized ) && ! empty( $serialized ) ) {
				$plain[] = $serialized;
			}
		}

		return $plain;
	}

	private function resolve_widget_config( array $node ): array {
		$type = Atomic_Elements_Utils::get_element_type( $node );

		if ( ! $type ) {
			return [];
		}

		$config = Widget_Context_Helper::get_widget_config( (string) $type );

		return is_array( $config ) ? $config : [];
	}

	private function resolve_post_id( $input ) {
		$post_id = isset( $input['post_id'] ) ? absint( $input['post_id'] ) : 0;

		if ( ! $post_id ) {
			return new \WP_Error(
				'invalid_post_id',
				__( 'A valid post_id is required.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		if ( ! current_user_can( 'edit_post', $post_id ) ) {
			return new \WP_Error(
				'rest_cannot_view',
				__( 'Sorry, you are not allowed to access this document.', 'elementor' ),
				[ 'status' => \WP_Http::FORBIDDEN ]
			);
		}

		return $post_id;
	}

	private function get_editable_document( int $post_id ) {
		$document = Plugin::$instance->documents->get( $post_id );

		if ( ! $document ) {
			return new \WP_Error(
				'document_not_found',
				__( 'Document not found.', 'elementor' ),
				[ 'status' => \WP_Http::NOT_FOUND ]
			);
		}

		if ( ! $document->is_built_with_elementor() ) {
			return new \WP_Error(
				'not_elementor',
				__( 'This post is not built with Elementor.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		if ( ! $document->is_editable_by_current_user() ) {
			return new \WP_Error(
				'rest_cannot_view',
				__( 'Sorry, you are not allowed to edit this document.', 'elementor' ),
				[ 'status' => \WP_Http::FORBIDDEN ]
			);
		}

		return $document;
	}
}
