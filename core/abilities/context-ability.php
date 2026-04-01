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
				'type'                 => 'object',
				'properties'           => [],
				'additionalProperties' => false,
			],
			'output_schema' => [
				'type'       => 'object',
				'properties' => [
					'global_classes'  => [ 'type' => 'object', 'description' => 'All global classes (frontend + preview + count).' ],
					'variables'       => [ 'type' => 'object', 'description' => 'All global variables (data + count + supported types).' ],
					'widget_types'    => [ 'type' => 'array', 'description' => 'Registered atomic widget type identifiers (e-heading, e-flexbox, etc.).' ],
					'style_reference' => [ 'type' => 'object', 'description' => 'Critical rules, prop types, and style schema for v4 styles.' ],
					'breakpoints'     => [ 'type' => 'object', 'description' => 'Active breakpoint configuration.' ],
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
						'widget_types: use with elementor/widget-schema to inspect a specific widget.',
						'style_reference.critical_rules: read before writing any style props.',
					] ),
					'readonly'    => true,
					'destructive' => false,
					'idempotent'  => true,
				],
			],
		];
	}

	public function execute( array $_input ): array {
		return [
			'global_classes'  => $this->get_global_classes(),
			'variables'       => $this->get_variables(),
			'widget_types'    => $this->get_widget_types(),
			'style_reference' => $this->get_style_reference(),
			'breakpoints'     => $this->get_breakpoints(),
		];
	}

	private function get_global_classes(): array {
		$kit      = $this->kits_manager->get_active_kit();
		$frontend = $kit->get_json_meta( Global_Classes_Repository::META_KEY_FRONTEND );
		$preview  = $kit->get_json_meta( Global_Classes_Repository::META_KEY_PREVIEW );

		if ( ! is_array( $frontend ) ) {
			$frontend = [ 'items' => [], 'order' => [] ];
		}
		if ( ! is_array( $preview ) ) {
			$preview = [ 'items' => [], 'order' => [] ];
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
		];
	}

	private function get_widget_types(): array {
		if ( ! did_action( 'elementor/elements/elements_registered' ) ) {
			do_action( 'elementor/elements/elements_registered', $this->elements_manager );
		}

		$widget_types = [];
		try {
			foreach ( $this->elements_manager->get_element_types() as $type => $object ) {
				if ( $object instanceof Atomic_Widget_Base ) {
					$widget_types[] = $type;
				}
			}
		} catch ( \Throwable $e ) {
			return [ 'error' => $e->getMessage() ];
		}

		return $widget_types;
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
