<?php

namespace Elementor\Modules\AtomicWidgets\Abilities;

use Elementor\Core\Abilities\Abstract_Ability;
use Elementor\Modules\AtomicWidgets\Elements\Base\Atomic_Widget_Base;
use Elementor\Modules\AtomicWidgets\PropTypes\Base\Array_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Union_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Style_Schema;
use Elementor\Widgets_Manager;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Returns the JSON-serialized schema for any Elementor v4 prop type by key.
 *
 * Eliminates the need to read prop-type PHP files to learn $$type shapes
 * (e.g. background-gradient-overlay, color-stop, html-v3). Walks both the
 * style schema and atomic widget prop schemas to build a single registry
 * keyed by Prop_Type::get_key().
 */
class Prop_Schema_Ability extends Abstract_Ability {

	private Widgets_Manager $widgets_manager;

	public function __construct( Widgets_Manager $widgets_manager ) {
		$this->widgets_manager = $widgets_manager;
	}

	protected function get_name(): string {
		return 'elementor/prop-schema';
	}

	protected function get_config(): array {
		return [
			'label'       => 'Elementor Prop Schema',
			'description' => 'Returns the full JSON schema for any Elementor v4 prop type ($$type) — the shape, defaults, allowed item types, and (for unions) the union members. Replaces reading prop-type PHP source files.',
			'category'    => 'elementor',
			'input_schema' => [
				'type'       => 'object',
				'properties' => [
					'type' => [
						'type'        => 'string',
						'description' => 'A $$type key (e.g. "background-gradient-overlay", "color-stop", "size", "html-v3"). Omit to list all available keys.',
					],
				],
				'additionalProperties' => false,
			],
			'output_schema' => [
				'type'       => 'object',
				'properties' => [
					'type'            => [ 'type' => 'string' ],
					'schema'          => [
						'type'        => 'object',
						'description' => 'Recursively-resolved schema for the requested type. Each nested Prop_Type is serialized via JsonSerializable.',
					],
					'available_types' => [
						'type'        => 'array',
						'description' => 'All registered prop type keys discovered by walking Style_Schema and every atomic widget props schema. Returned both when `type` is omitted and when an unknown key is requested.',
						'items'       => [ 'type' => 'string' ],
					],
					'error'           => [
						'type'        => 'string',
						'description' => 'Set when the requested type is not registered.',
					],
				],
			],
			'meta' => [
				'show_in_rest' => true,
				'mcp'          => [ 'public' => true ],
				'annotations'  => [
					'instructions' => implode( "\n", [
						'Use this BEFORE building any prop value whose shape you do not already know. One round-trip replaces reading 3-5 prop-type PHP files.',
						'Pass type="<key>" — e.g. "background-gradient-overlay", "color-stop", "gradient-color-stop", "shadow", "dimensions", "html-v3", "link".',
						'Omit type to list every registered prop key (use this to discover available shapes).',
						'The schema field is the full recursive serialization. For Object_Prop_Type, schema.shape is keyed by field name and each field is itself a serialized Prop_Type. For Union_Prop_Type, schema.prop_types is keyed by member type key.',
						'For widget-prop discovery (per-widget settings keys), use elementor/widget-schema. This ability is for the $$type-keyed prop type catalog.',
					] ),
					'readonly'    => true,
					'destructive' => false,
					'idempotent'  => true,
				],
			],
		];
	}

	public function execute( array $input ): array {
		$registry = $this->build_registry();
		$keys     = array_keys( $registry );
		sort( $keys );

		$type = isset( $input['type'] ) && is_string( $input['type'] ) ? $input['type'] : null;

		if ( null === $type || '' === $type ) {
			return [
				'available_types' => $keys,
			];
		}

		if ( ! isset( $registry[ $type ] ) ) {
			return [
				'type'            => $type,
				'error'           => "Prop type \"$type\" is not registered. See available_types for the full list.",
				'available_types' => $keys,
			];
		}

		return [
			'type'   => $type,
			'schema' => $this->serialize( $registry[ $type ] ),
		];
	}

	/**
	 * Build a registry of every prop type reachable from the style schema
	 * and from every registered atomic widget's props schema.
	 *
	 * @return array<string, Prop_Type>
	 */
	private function build_registry(): array {
		$registry = [];

		try {
			foreach ( Style_Schema::get() as $prop_type ) {
				if ( $prop_type instanceof Prop_Type ) {
					$this->collect( $prop_type, $registry );
				}
			}
		} catch ( \Throwable $e ) {
			unset( $e );
		}

		try {
			foreach ( $this->widgets_manager->get_widget_types() as $widget ) {
				if ( ! ( $widget instanceof Atomic_Widget_Base ) ) {
					continue;
				}
				foreach ( $widget::get_props_schema() as $prop_type ) {
					if ( $prop_type instanceof Prop_Type ) {
						$this->collect( $prop_type, $registry );
					}
				}
			}
		} catch ( \Throwable $e ) {
			unset( $e );
		}

		return $registry;
	}

	/**
	 * Recursively collect $prop_type and all nested prop types into $registry,
	 * keyed by get_key(). Union has no key of its own — its members are collected.
	 *
	 * @param array<string, Prop_Type> $registry Accumulator (modified in-place).
	 */
	private function collect( Prop_Type $prop_type, array &$registry ): void {
		if ( $prop_type instanceof Union_Prop_Type ) {
			foreach ( $prop_type->get_prop_types() as $member ) {
				if ( $member instanceof Prop_Type ) {
					$this->collect( $member, $registry );
				}
			}
			return;
		}

		$key = $prop_type::get_key();

		if ( isset( $registry[ $key ] ) ) {
			return;
		}

		$registry[ $key ] = $prop_type;

		if ( $prop_type instanceof Object_Prop_Type ) {
			foreach ( $prop_type->get_shape() as $field ) {
				if ( $field instanceof Prop_Type ) {
					$this->collect( $field, $registry );
				}
			}
			return;
		}

		if ( $prop_type instanceof Array_Prop_Type ) {
			$item = $prop_type->get_item_type();
			if ( $item instanceof Prop_Type ) {
				$this->collect( $item, $registry );
			}
		}
	}

	/**
	 * Serialize a Prop_Type into a plain array. Round-trips through json_encode
	 * because every Prop_Type implements JsonSerializable and may nest other
	 * JsonSerializable instances.
	 */
	private function serialize( Prop_Type $prop_type ): array {
		$encoded = wp_json_encode( $prop_type );
		if ( false === $encoded ) {
			return [ 'error' => 'Failed to serialize prop type.' ];
		}
		$decoded = json_decode( $encoded, true );
		return is_array( $decoded ) ? $decoded : [ 'error' => 'Failed to decode prop type.' ];
	}
}
