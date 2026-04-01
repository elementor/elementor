<?php

namespace Elementor\Modules\AtomicWidgets\Abilities;

use Elementor\Core\Abilities\Abstract_Ability;
use Elementor\Modules\AtomicWidgets\Elements\Base\Atomic_Widget_Base;
use Elementor\Widgets_Manager;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Widget_Schema_Ability extends Abstract_Ability {

	private Widgets_Manager $widgets_manager;

	public function __construct( Widgets_Manager $widgets_manager ) {
		$this->widgets_manager = $widgets_manager;
	}

	protected function get_name(): string {
		return 'elementor/widget-schema';
	}

	protected function get_config(): array {
		return [
			'label'       => 'Elementor Widget Schema',
			'description' => 'Returns the props schema (settings keys, types, and defaults) for a registered Elementor atomic widget type.',
			'category'    => 'elementor',
			'input_schema' => [
				'type'       => 'object',
				'properties' => [
					'widget_type' => [
						'type'        => 'string',
						'description' => 'Atomic widget type identifier, e.g. "e-heading", "e-image", "e-paragraph".',
					],
				],
				'required'             => [ 'widget_type' ],
				'additionalProperties' => false,
			],
			'output_schema' => [
				'type'       => 'object',
				'properties' => [
					'widget_type'  => [ 'type' => 'string' ],
					'props_schema' => [
						'type'        => 'object',
						'description' => 'Keyed by prop name. Each entry describes the prop type and default value.',
					],
					'defaults' => [
						'type'        => 'object',
						'description' => 'Default values for all props, in the $$type format ready to use in element settings.',
					],
					'available_types' => [
						'type'        => 'array',
						'description' => 'All registered atomic widget type identifiers, for reference.',
					],
				],
			],
			'meta' => [
				'show_in_rest' => true,
				'mcp'          => [ 'public' => true ],
				'annotations'  => [
					'instructions' => implode( "\n", [
						'Returns the props schema for an atomic widget type.',
						'Use this to discover what settings keys a widget accepts and their default values.',
						'props_schema keys map directly to the element settings object.',
						'defaults shows the default $$type-wrapped values you can use as a starting point.',
						'Use the available_types list or elementor/context widget_types to find registered types.',
					] ),
					'readonly'    => true,
					'destructive' => false,
					'idempotent'  => true,
				],
			],
		];
	}

	public function execute( array $input ): array {
		$widget_type  = $input['widget_type'];
		$widget_types = $this->widgets_manager->get_widget_types();

		// Build available atomic types for reference.
		$available = [];
		foreach ( $widget_types as $type => $object ) {
			if ( $object instanceof Atomic_Widget_Base ) {
				$available[] = $type;
			}
		}

		// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
		error_log( '[Elementor widget-schema] execute: requested=' . $widget_type . ', total_widgets=' . count( $widget_types ) . ', atomic_count=' . count( $available ) . ', atomic_types=' . implode( ', ', $available ) );

		if ( ! isset( $widget_types[ $widget_type ] ) ) {
			return [
				'widget_type'     => $widget_type,
				'error'           => "Widget type \"$widget_type\" is not registered.",
				'available_types' => $available,
			];
		}

		$widget = $widget_types[ $widget_type ];

		if ( ! ( $widget instanceof Atomic_Widget_Base ) ) {
			return [
				'widget_type'     => $widget_type,
				'error'           => "\"$widget_type\" is registered but is not an atomic widget.",
				'available_types' => $available,
			];
		}

		$props_schema = $widget::get_props_schema();
		$defaults     = [];

		foreach ( $props_schema as $key => $prop_type ) {
			try {
				$default = $prop_type->get_default();
				if ( null !== $default ) {
					$defaults[ $key ] = $default;
				}
			} catch ( \Throwable $e ) {
				unset( $e );
			}
		}

		$schema_summary = [];
		foreach ( $props_schema as $key => $prop_type ) {
			$schema_summary[ $key ] = [
				'prop_type'   => ( new \ReflectionClass( $prop_type ) )->getShortName(),
				'has_default' => isset( $defaults[ $key ] ),
			];
		}

		return [
			'widget_type'     => $widget_type,
			'props_schema'    => $schema_summary,
			'defaults'        => $defaults,
			'available_types' => $available,
		];
	}
}
