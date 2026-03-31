<?php

namespace Elementor\Modules\AtomicWidgets\Abilities;

use Elementor\Elements_Manager;
use Elementor\Modules\AtomicWidgets\Elements\Base\Atomic_Widget_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Widget_Schema_Ability {

	private Elements_Manager $elements_manager;

	public function __construct( Elements_Manager $elements_manager ) {
		$this->elements_manager = $elements_manager;
	}

	public function register_hooks(): void {
		add_action( 'wp_abilities_api_init', [ $this, 'register_ability' ] );
	}

	public function register_ability(): void {
		wp_register_ability( 'elementor/widget-schema', [
			'label'       => 'Elementor Widget Schema',
			'description' => 'Returns the props schema (settings keys, types, and defaults) for a registered Elementor atomic widget type.',
			'category'    => 'elementor',
			'input_schema' => [
				'type'       => 'object',
				'properties' => [
					'widget_type' => [
						'type'        => 'string',
						'description' => 'Atomic widget type identifier, e.g. "e-heading", "e-flexbox", "e-image".',
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
			'execute_callback'    => [ $this, 'execute' ],
			'permission_callback' => [ $this, 'permission' ],
			'meta' => [
				'show_in_rest' => true,
				'mcp'          => [ 'public' => true ],
				'annotations'  => [
					'instructions' => implode( "\n", [
						'Returns the props schema for an atomic widget type.',
						'Use this to discover what settings keys a widget accepts and their default values.',
						'props_schema keys map directly to the element settings object.',
						'defaults shows the default $$type-wrapped values you can use as a starting point.',
						'Call elementor/atomic-widgets to get the list of registered widget types first.',
					] ),
					'readonly'    => true,
					'destructive' => false,
					'idempotent'  => true,
				],
			],
		] );
	}

	public function permission(): bool {
		return current_user_can( 'manage_options' );
	}

	public function execute( array $input ): array {
		$widget_type    = $input['widget_type'];
		$element_types  = $this->elements_manager->get_element_types();
		$available      = [];

		foreach ( $element_types as $type => $object ) {
			if ( $object instanceof Atomic_Widget_Base ) {
				$available[] = $type;
			}
		}

		if ( ! isset( $element_types[ $widget_type ] ) ) {
			return [
				'widget_type'     => $widget_type,
				'error'           => "Widget type \"$widget_type\" is not registered.",
				'available_types' => $available,
			];
		}

		$element = $element_types[ $widget_type ];

		if ( ! ( $element instanceof Atomic_Widget_Base ) ) {
			return [
				'widget_type'     => $widget_type,
				'error'           => "\"$widget_type\" is registered but is not an atomic widget.",
				'available_types' => $available,
			];
		}

		$props_schema = $element::get_props_schema();
		$defaults     = [];

		foreach ( $props_schema as $key => $prop_type ) {
			try {
				$default = $prop_type->get_default();
				if ( null !== $default ) {
					$defaults[ $key ] = $default;
				}
			} catch ( \Throwable $e ) {
				// Some prop types have no default — skip silently.
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
