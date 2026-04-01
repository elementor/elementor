<?php

namespace Elementor\Core\Abilities;

use Elementor\Core\Breakpoints\Manager as Breakpoints_Manager;
use Elementor\Core\Kits\Manager as Kits_Manager;
use Elementor\Elements_Manager;
use Elementor\Modules\AtomicWidgets\Abilities\V4_Styles_Reference;
use Elementor\Modules\AtomicWidgets\Elements\Base\Atomic_Widget_Base;
use Elementor\Modules\AtomicWidgets\Styles\Style_Schema;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Modules\Variables\Storage\Constants;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Context_Ability extends Abstract_Ability {

	private Kits_Manager $kits_manager;
	private Elements_Manager $elements_manager;
	private Breakpoints_Manager $breakpoints_manager;

	public function __construct(
		Kits_Manager $kits_manager,
		Elements_Manager $elements_manager,
		Breakpoints_Manager $breakpoints_manager
	) {
		$this->kits_manager        = $kits_manager;
		$this->elements_manager    = $elements_manager;
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
				],
			],
			'meta' => [
				'show_in_rest' => true,
				'mcp'          => [ 'public' => true ],
				'annotations'  => [
					'instructions' => implode( "\n", [
						'CALL THIS FIRST at the start of every Elementor session.',
						'Returns all context needed for Elementor work in a single round-trip, replacing:',
						'  elementor/global-classes + elementor/variables + elementor/atomic-widgets + elementor/v4-styles',
						'global_classes.frontend.items: keyed by class ID — use IDs in settings.classes.',
						'variables.data.data: keyed by variable ID — use IDs in $$type variable props.',
						'variables.watermark: integer — pass as since_watermark.variables on the NEXT call to skip the variables payload if nothing changed.',
						'widget_types: use with elementor/widget-schema to inspect a specific widget.',
						'style_reference.critical_rules: read before writing any style props.',
						'since_watermark.variables: if provided and matches current watermark, variables returns { changed: false, watermark: N } instead of full data.',
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

		$cached = get_transient( $this->get_cache_key() );

		if ( false !== $cached ) {
			return $this->apply_since_watermark( $cached, $since_watermark );
		}

		$result = [
			'global_classes'  => $this->get_global_classes(),
			'variables'       => $this->get_variables(),
			'widget_types'    => $this->get_widget_types(),
			'style_reference' => $this->get_style_reference(),
			'breakpoints'     => $this->get_breakpoints(),
		];

		set_transient( $this->get_cache_key(), $result, HOUR_IN_SECONDS );

		return $this->apply_since_watermark( $result, $since_watermark );
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
			$element_types = $this->elements_manager->get_element_types();

			// Widgets_Manager is constructed before Modules_Manager in init_components(),
			// so it can trigger init_elements() (and cache _element_types) before the
			// atomic module has registered its elementor/elements/elements_registered hook.
			// Detect this by checking whether any atomic types are present; if not,
			// re-fire the action — the atomic module's hook is now in place.
			$has_atomic = false;
			foreach ( $element_types as $obj ) {
				if ( $obj instanceof Atomic_Widget_Base ) {
					$has_atomic = true;
					break;
				}
			}

			if ( ! $has_atomic ) {
				do_action( 'elementor/elements/elements_registered', $this->elements_manager );
				$element_types = $this->elements_manager->get_element_types();
			}

			$widget_types = [];
			foreach ( $element_types as $type => $object ) {
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
