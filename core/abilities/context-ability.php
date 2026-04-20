<?php

namespace Elementor\Core\Abilities;

use Elementor\Core\Breakpoints\Manager as Breakpoints_Manager;
use Elementor\Core\Kits\Manager as Kits_Manager;
use Elementor\Modules\AtomicWidgets\Abilities\V4_Styles_Reference;
use Elementor\Modules\AtomicWidgets\Elements\Base\Atomic_Widget_Base;
use Elementor\Modules\AtomicWidgets\Styles\Style_Schema;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Modules\Variables\Storage\Constants;
use Elementor\Widgets_Manager;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Context_Ability extends Abstract_Ability {

	private Kits_Manager $kits_manager;
	private Widgets_Manager $widgets_manager;
	private Breakpoints_Manager $breakpoints_manager;

	public function __construct(
		Kits_Manager $kits_manager,
		Widgets_Manager $widgets_manager,
		Breakpoints_Manager $breakpoints_manager
	) {
		$this->kits_manager        = $kits_manager;
		$this->widgets_manager     = $widgets_manager;
		$this->breakpoints_manager = $breakpoints_manager;

		add_action( 'elementor/global_classes/update', [ $this, 'clear_cache' ] );
		add_action( 'elementor/variables/save', [ $this, 'clear_cache' ] );
	}

	public function clear_cache(): void {
		delete_transient( $this->get_cache_key() );
	}

	private function get_cache_key(): string {
		return 'elementor_ctx_' . substr( md5( ELEMENTOR_VERSION ), 0, 8 );
	}

	protected function get_name(): string {
		return 'elementor/context';
	}

	protected function get_config(): array {
		return [
			'label'       => 'Elementor Context (Preflight)',
			'description' => 'Returns everything needed to start working with Elementor in one call: global classes, variables, registered widget types, style reference, and breakpoints.',
			'category'    => 'elementor',
			'input_schema' => [
				'type'       => 'object',
				'properties' => [
					'since_watermark' => [
						'type'        => 'object',
						'description' => 'Pass watermarks from a previous response to skip unchanged sections.',
						'properties'  => [
							'variables' => [
								'type'        => 'integer',
								'description' => 'Variables watermark from a prior context response.',
							],
						],
						'additionalProperties' => false,
					],
					'section' => [
						'type'        => 'string',
						'description' => 'Fetch only one section of the context to keep the payload small. One of: "summary" (counts + labels + widget_types + breakpoints, ~5KB), "classes" (global_classes + class_labels), "variables", "style_reference", "breakpoints". Omit for the full payload (default, backward-compatible).',
						'enum'        => [ 'summary', 'classes', 'variables', 'style_reference', 'breakpoints', 'all' ],
					],
				],
				'additionalProperties' => false,
			],
			'output_schema' => [
				'type'       => 'object',
				'properties' => [
					'global_classes'  => [
						'type'        => 'object',
						'description' => 'All global classes (frontend + preview + count).',
					],
					'variables'       => [
						'type'        => 'object',
						'description' => 'All global variables (data + count + supported types + watermark). Returns { changed: false, watermark: N } if since_watermark.variables matches.',
					],
					'widget_types'    => [
						'type'        => 'array',
						'description' => 'Registered atomic widget type identifiers (e-heading, e-flexbox, etc.).',
					],
					'style_reference' => [
						'type'        => 'object',
						'description' => 'Critical rules, prop types, and style schema for v4 styles.',
					],
					'breakpoints'     => [
						'type'        => 'object',
						'description' => 'Active breakpoint configuration.',
					],
					'class_labels'    => [
						'type'        => 'object',
						'description' => 'Flat map of label → full class ID (e.g. {"ajax-hero-outer":"e-gc-9705bfbc-2335-4e75-b761-71e4973977df"}). Use this to wire class IDs without scanning the full global_classes payload.',
					],
				],
			],
			'meta' => [
				'show_in_rest' => true,
				'mcp'          => [ 'public' => true ],
				'annotations'  => [
					'instructions' => implode( "\n", [
						'CALL THIS FIRST at the start of every Elementor session.',
						'TOOL CHOICE: Use Elementor abilities (elementor/build-page, elementor/set-post-content, elementor/create-post, elementor/make-widget) for ALL page building. Avoid novamira/execute-php for Elementor work — it has no schema validation, no auto-mirror, no error batching, and styles saved through it bypass the build pipeline entirely.',
						'RECOMMENDED: pass section="summary" on the first call (~5KB: counts + class_labels + widget_types + breakpoints). Fetch heavier slices on demand: section="classes" (full global_classes payload), "variables", "style_reference". Omit section entirely for the full payload (legacy behavior, can be 100KB+).',
						'All slices include a top-level `summary` object with counts so you always know if there are classes/variables you need to fetch.',
						'global_classes.frontend.items: keyed by class ID — use IDs in settings.classes.',
						'class_labels: flat label→full_id map — shortcut to get class IDs without scanning global_classes.frontend.items.',
						'variables.data.data: keyed by variable ID — use IDs in $$type variable props.',
						'variables.watermark: integer — pass as since_watermark.variables on the NEXT call to skip the variables payload if nothing changed.',
						'widget_types: use with elementor/widget-schema to inspect a specific widget. NOTE: e-flexbox is a container, not a widget — do NOT call widget-schema for it.',
						'For enum-backed widget props (tag, text-align, border-style, …) widget-schema now returns props_schema[key].allowed_values — use that instead of trial-and-error saves.',
						'ELEMENT TYPES: e-flexbox → container (elType:"e-flexbox", has "elements" children, NO widgetType). widget → leaf (elType:"widget" + widgetType).',
						'style_reference.critical_rules: read before writing any style props.',
						'since_watermark.variables: if provided and matches current watermark, variables returns { changed: false, watermark: N } instead of full data.',
						'For new pages: prefer elementor/build-page — creates variables, classes, and elements atomically in one call. build-page now auto-mirrors every local style key into settings.classes.value and auto-fills missing style.label from the style id.',
						'For existing pages: get-post-content → modify → set-post-content.',
						'For a helper catalog (make-widget, diff-tree, create-post, preview-render, prop-schema), call wp_mcp-adapter-discover-abilities or read get-ability-info by name.',
					] ),
					'readonly'    => true,
					'destructive' => false,
					'idempotent'  => true,
				],
			],
		];
	}

	public function execute( array $input ): array {
		$since_watermark = $input['since_watermark'] ?? null;
		$section         = $input['section'] ?? null;

		$cache_key = $this->get_cache_key();
		$cached    = get_transient( $cache_key );

		if ( false === $cached ) {
			$global_classes = $this->get_global_classes();

			$cached = [
				'global_classes'  => $global_classes,
				'class_labels'    => $this->get_class_labels( $global_classes ),
				'variables'       => $this->get_variables(),
				'widget_types'    => $this->get_widget_types(),
				'style_reference' => $this->get_style_reference(),
				'breakpoints'     => $this->get_breakpoints(),
			];

			set_transient( $cache_key, $cached, HOUR_IN_SECONDS );
		}

		$result = $this->slice_section( $cached, $section );

		return $this->apply_since_watermark( $result, $since_watermark );
	}

	/**
	 * Return only the requested slice of the cached context. Keeps the payload small
	 * — the full context is 100KB+ once class + variable counts grow, which blows past
	 * the MCP token budget on preflight.
	 */
	private function slice_section( array $full, ?string $section ): array {
		if ( null === $section || 'all' === $section ) {
			return $full;
		}

		$meta = [
			'section' => $section,
			'summary' => [
				'global_classes_count' => $full['global_classes']['count'] ?? 0,
				'variables_count'      => $full['variables']['count'] ?? 0,
				'widget_types_count'   => is_array( $full['widget_types'] ?? null ) ? count( $full['widget_types'] ) : 0,
				'variables_watermark'  => $full['variables']['watermark'] ?? 0,
			],
		];

		switch ( $section ) {
			case 'summary':
				return array_merge( $meta, [
					'class_labels'     => $full['class_labels'] ?? [],
					'widget_types'     => $full['widget_types'] ?? [],
					'breakpoints'      => $full['breakpoints'] ?? [],
				] );
			case 'classes':
				return array_merge( $meta, [
					'global_classes' => $full['global_classes'] ?? [],
					'class_labels'   => $full['class_labels'] ?? [],
				] );
			case 'variables':
				return array_merge( $meta, [
					'variables' => $full['variables'] ?? [],
				] );
			case 'style_reference':
				return array_merge( $meta, [
					'style_reference' => $full['style_reference'] ?? [],
				] );
			case 'breakpoints':
				return array_merge( $meta, [
					'breakpoints' => $full['breakpoints'] ?? [],
				] );
		}

		return $full;
	}

	private function apply_since_watermark( array $result, ?array $since_watermark ): array {
		if ( empty( $since_watermark ) ) {
			return $result;
		}

		$vars_watermark = $since_watermark['variables'] ?? null;

		if ( null !== $vars_watermark && isset( $result['variables']['watermark'] ) && (int) $vars_watermark === (int) $result['variables']['watermark'] ) {
			$result['variables'] = [
				'watermark' => $result['variables']['watermark'],
				'changed'   => false,
			];
		}

		return $result;
	}

	private function get_class_labels( array $global_classes ): array {
		$map = [];
		foreach ( $global_classes['frontend']['items'] ?? [] as $id => $item ) {
			if ( isset( $item['label'] ) ) {
				$map[ $item['label'] ] = $id;
			}
		}
		return $map;
	}

	private function get_global_classes(): array {
		$kit      = $this->kits_manager->get_active_kit();
		$frontend = $kit->get_json_meta( Global_Classes_Repository::META_KEY_FRONTEND );
		$preview  = $kit->get_json_meta( Global_Classes_Repository::META_KEY_PREVIEW );

		if ( ! is_array( $frontend ) ) {
			$frontend = [
				'items' => [],
				'order' => [],
			];
		}
		if ( ! is_array( $preview ) ) {
			$preview = [
				'items' => [],
				'order' => [],
			];
		}

		return [
			'frontend' => $frontend,
			'preview'  => $preview,
			'count'    => count( $frontend['items'] ?? [] ),
		];
	}

	private function get_variables(): array {
		$kit       = $this->kits_manager->get_active_kit();
		$variables = $kit->get_json_meta( Constants::VARIABLES_META_KEY );

		if ( ! is_array( $variables ) ) {
			$variables = [
				'format_version' => Constants::FORMAT_VERSION_V2,
				'data'           => [],
			];
		}

		return [
			'data'            => $variables,
			'count'           => count( $variables['data'] ?? [] ),
			'supported_types' => [ 'color', 'font', 'size' ],
			'max_per_site'    => Constants::TOTAL_VARIABLES_COUNT,
			'watermark'       => (int) ( $variables['watermark'] ?? 0 ),
		];
	}

	private function get_widget_types(): array {
		try {
			$widget_types = [];

			foreach ( $this->widgets_manager->get_widget_types() as $type => $object ) {
				if ( $object instanceof Atomic_Widget_Base ) {
					$widget_types[] = $type;
				}
			}

			return $widget_types;
		} catch ( \Throwable $e ) {
			return [ 'error' => $e->getMessage() ];
		}
	}

	private function get_style_reference(): array {
		$style_schema = null;
		try {
			$style_schema = Style_Schema::get();
		} catch ( \Throwable $e ) {
			$style_schema = [ 'error' => $e->getMessage() ];
		}

		return [
			'critical_rules'    => V4_Styles_Reference::get_critical_rules(),
			'prop_types'        => V4_Styles_Reference::get_prop_types(),
			'style_schema'      => $style_schema,
			'element_structure' => V4_Styles_Reference::get_element_structure(),
		];
	}

	private function get_breakpoints(): array {
		try {
			return $this->breakpoints_manager->get_breakpoints_config();
		} catch ( \Throwable $e ) {
			return [ 'error' => $e->getMessage() ];
		}
	}
}
