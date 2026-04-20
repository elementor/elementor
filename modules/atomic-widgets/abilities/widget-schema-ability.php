<?php

namespace Elementor\Modules\AtomicWidgets\Abilities;

use Elementor\Core\Abilities\Abstract_Ability;
use Elementor\Modules\AtomicWidgets\Elements\Base\Atomic_Widget_Base;
use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Union_Prop_Type;
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
						'description' => 'Keyed by prop name. Each entry describes the prop type, default/example presence, and — for types with an enum (directly or via Union members) — an `allowed_values` array listing every legal value.',
					],
					'defaults' => [
						'type'        => 'object',
						'description' => 'Raw get_default() values for each prop. Note: for Object props (e.g. "image") this can be an empty envelope like {"$$type":"image","value":[]} when shape-field defaults are set on nested fields rather than the top-level prop. Prefer `examples` for a ready-to-use payload.',
					],
					'examples' => [
						'type'        => 'object',
						'description' => 'Working example values per prop — the $$type-wrapped payload you can paste straight into element settings. For Object props this is synthesized by folding shape-field defaults/initial_values into the envelope, so widgets like e-image return a filled image/src/url tree instead of an empty one.',
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
						'Use this to discover what settings keys a widget accepts and their default/example values.',
						'props_schema keys map directly to the element settings object.',
						'props_schema[key].allowed_values (when present) is the complete list of legal values for enum-backed types (direct enum setting, or any Union member with an enum) — use this instead of trial-and-error saves.',
						'examples gives a ready-to-paste $$type-wrapped payload per prop — prefer this over defaults.',
						'defaults returns raw get_default() output; can be an empty envelope (e.g. {"$$type":"image","value":[]}) when the widget sets defaults on shape-fields instead of the top-level prop.',
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
		$examples     = [];

		foreach ( $props_schema as $key => $prop_type ) {
			try {
				$default = $prop_type->get_default();
				if ( null !== $default ) {
					$defaults[ $key ] = $default;
				}
			} catch ( \Throwable $e ) {
				unset( $e );
			}

			try {
				$example = $this->build_example( $prop_type );
				if ( null !== $example ) {
					$examples[ $key ] = $example;
				}
			} catch ( \Throwable $e ) {
				unset( $e );
			}
		}

		$schema_summary = [];
		foreach ( $props_schema as $key => $prop_type ) {
			$summary = [
				'prop_type'    => ( new \ReflectionClass( $prop_type ) )->getShortName(),
				'has_default'  => isset( $defaults[ $key ] ),
				'has_example'  => isset( $examples[ $key ] ),
			];

			$allowed = $this->extract_allowed_values( $prop_type );
			if ( null !== $allowed ) {
				$summary['allowed_values'] = $allowed;
			}

			$schema_summary[ $key ] = $summary;
		}

		return [
			'widget_type'     => $widget_type,
			'props_schema'    => $schema_summary,
			'defaults'        => $defaults,
			'examples'        => $examples,
			'available_types' => $available,
		];
	}

	/**
	 * When the prop type (or any of its Union members) carries an enum setting,
	 * return the flattened list of allowed values. Used to surface the legal set
	 * directly in widget-schema output instead of forcing a save-to-discover loop.
	 *
	 * Returns null when no enum is present anywhere in the type.
	 */
	private function extract_allowed_values( $prop_type ): ?array {
		$values = [];

		if ( $prop_type instanceof Union_Prop_Type ) {
			foreach ( $prop_type->get_prop_types() as $member ) {
				if ( ! ( $member instanceof Prop_Type ) ) {
					continue;
				}
				$nested = $this->extract_allowed_values( $member );
				if ( null !== $nested ) {
					foreach ( $nested as $v ) {
						$values[] = $v;
					}
				}
			}
			return empty( $values ) ? null : array_values( array_unique( $values ) );
		}

		if ( method_exists( $prop_type, 'get_settings' ) ) {
			$settings = $prop_type->get_settings();
			if ( is_array( $settings ) && ! empty( $settings['enum'] ) && is_array( $settings['enum'] ) ) {
				foreach ( $settings['enum'] as $v ) {
					if ( is_scalar( $v ) ) {
						$values[] = $v;
					}
				}
			}
		}

		return empty( $values ) ? null : array_values( array_unique( $values ) );
	}

	private function build_example( Prop_Type $prop_type ) {
		if ( method_exists( $prop_type, 'get_initial_value' ) ) {
			$initial = $prop_type->get_initial_value();
			if ( null !== $initial ) {
				return $initial;
			}
		}

		if ( $prop_type instanceof Object_Prop_Type ) {
			$value = [];
			foreach ( $prop_type->get_shape() as $field_key => $field ) {
				if ( ! ( $field instanceof Prop_Type ) ) {
					continue;
				}

				$field_value = null;

				if ( method_exists( $field, 'get_initial_value' ) ) {
					$field_value = $field->get_initial_value();
				}

				if ( null === $field_value ) {
					$field_value = $field->get_default();
				}

				if ( null !== $field_value ) {
					$value[ $field_key ] = $field_value;
				}
			}

			if ( ! empty( $value ) ) {
				return $prop_type::generate( $value );
			}
		}

		return $prop_type->get_default();
	}
}
