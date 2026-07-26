<?php

namespace Elementor\Modules\Mcp\Abilities\Build_Composition;

use Elementor\Core\Base\Document;
use Elementor\Modules\AtomicWidgets\PropTypes\Union_Prop_Type;
use Elementor\Modules\Components\Circular_Dependency_Validator;
use Elementor\Modules\Components\Components_Repository;
use Elementor\Modules\Components\Documents\Component as Component_Document;
use Elementor\Modules\Components\Documents\Component_Overridable_Prop;
use Elementor\Modules\Components\Utils\Parsing_Utils;
use Elementor\Modules\Components\Widgets\Component_Instance;
use Elementor\Modules\Mcp\Abilities\Llm_Prop_Value_Adjuster;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Component_Instance_Applier {

	private Components_Repository $repository;

	public function __construct( Components_Repository $repository ) {
		$this->repository = $repository;
	}

	/**
	 * Rewrites shorthand component-instance entries in $element_config in-place.
	 *
	 * For every element whose widgetType is 'e-component', if the config entry looks
	 * like shorthand ({ component_id, overrides?: {...} }), it is replaced with the
	 * full component_instance PropValue envelope that Props_Parser expects.
	 *
	 * @param array<string, array&> $config_id_index    Index of subtree refs (from Subtree_Builder).
	 * @param array                 $element_config     Per-config-id settings (modified by reference).
	 * @param Document              $document           Target document (used for circular-dep check).
	 * @param array                 $rewritten_config_ids Config-ids whose settings were fully resolved here
	 *                                                     and must bypass generic schema adjustment downstream.
	 * @return \WP_Error|null
	 */
	public function rewrite( array $config_id_index, array &$element_config, Document $document, array &$rewritten_config_ids = [] ): ?\WP_Error {
		$errors = [];

		foreach ( $element_config as $config_id => $settings ) {
			if ( ! isset( $config_id_index[ $config_id ] ) || ! is_array( $settings ) ) {
				continue;
			}

			$node = $config_id_index[ $config_id ];
			if ( ( $node['widgetType'] ?? null ) !== Component_Instance::get_element_type() ) {
				continue;
			}

			if ( ! $this->is_shorthand( $settings ) ) {
				continue;
			}

			$rewritten = $this->rewrite_entry( $config_id, $settings, $document, $errors );

			if ( null !== $rewritten ) {
				$element_config[ $config_id ] = $rewritten;
				$rewritten_config_ids[] = $config_id;
			}
		}

		if ( empty( $errors ) ) {
			return null;
		}

		return new \WP_Error(
			'elementor_invalid_component_instance',
			implode( ' ', $errors ),
			[ 'status' => \WP_Http::BAD_REQUEST ]
		);
	}

	private function is_shorthand( array $settings ): bool {
		return array_key_exists( 'component_id', $settings )
			&& ! isset( $settings['component_instance']['$$type'] );
	}

	private function rewrite_entry( string $config_id, array $settings, Document $document, array &$errors ): ?array {
		$component_id = (int) ( $settings['component_id'] ?? 0 );

		if ( ! $component_id ) {
			$errors[] = sprintf( '[%s] component_id must be a non-zero integer.', $config_id );
			return null;
		}

		$component = $this->repository->get( $component_id, false );

		if ( ! $component ) {
			$errors[] = sprintf(
				'[%s] Component %d not found.',
				$config_id,
				$component_id
			);
			return null;
		}

		if ( $component->get_is_archived() ) {
			$errors[] = sprintf(
				'[%s] Component %d is archived and cannot be placed.',
				$config_id,
				$component_id
			);
			return null;
		}

		if ( $document instanceof Component_Document ) {
			$circular_result = Circular_Dependency_Validator::make()->validate(
				$document->get_main_id(),
				[ $this->make_placeholder_element( $component_id ) ]
			);

			if ( ! $circular_result['success'] ) {
				$errors[] = sprintf( '[%s] %s', $config_id, implode( ' ', $circular_result['messages'] ) );
				return null;
			}
		}

		$overridable_props = $component->get_overridable_props();
		$raw_overrides = is_array( $settings['overrides'] ?? null ) ? $settings['overrides'] : [];

		$override_errors = $this->validate_override_keys( $config_id, $raw_overrides, $overridable_props->props );
		if ( ! empty( $override_errors ) ) {
			$errors = array_merge( $errors, $override_errors );
			return null;
		}

		$overrides_value = $this->build_overrides_value( $raw_overrides, $overridable_props->props, $component_id );

		return [
			'component_instance' => [
				'$$type' => 'component-instance',
				'value'  => [
					'component_id' => [ '$$type' => 'number', 'value' => $component_id ],
					'overrides'    => [
						'$$type' => 'overrides',
						'value'  => $overrides_value,
					],
				],
			],
		];
	}

	private function validate_override_keys( string $config_id, array $raw_overrides, array $overridable_props ): array {
		$errors = [];
		$valid_keys = array_keys( $overridable_props );

		foreach ( array_keys( $raw_overrides ) as $override_key ) {
			if ( ! array_key_exists( $override_key, $overridable_props ) ) {
				$errors[] = sprintf(
					'[%s] Unknown override key "%s". Valid keys: %s.',
					$config_id,
					$override_key,
					empty( $valid_keys ) ? '(none)' : implode( ', ', $valid_keys )
				);
			}
		}

		return $errors;
	}

	private function build_overrides_value( array $raw_overrides, array $overridable_props, int $component_id ): array {
		$overrides = [];

		foreach ( $raw_overrides as $override_key => $raw_value ) {
			$prop = $overridable_props[ $override_key ] ?? null;

			$override_value = $this->resolve_override_value( $raw_value, $prop );

			$overrides[] = [
				'$$type' => 'override',
				'value'  => [
					'override_key'   => $override_key,
					'override_value' => $override_value,
					'schema_source'  => [ 'type' => 'component', 'id' => $component_id ],
				],
			];
		}

		return $overrides;
	}

	private function resolve_override_value( $raw_value, ?Component_Overridable_Prop $prop ) {
		if ( null === $raw_value ) {
			return null;
		}

		$origin_prop_type = $this->resolve_origin_prop_type( $prop );
		$force_key = $this->resolve_force_key( $origin_prop_type );

		$adjusted = Llm_Prop_Value_Adjuster::adjust(
			is_array( $raw_value ) ? $raw_value : [ '$$type' => $force_key, 'value' => $raw_value ],
			[ 'force_key' => $force_key ]
		);

		return $adjusted ?? $raw_value;
	}

	private function resolve_force_key( $origin_prop_type ): ?string {
		if ( ! $origin_prop_type || $origin_prop_type instanceof Union_Prop_Type ) {
			return null;
		}

		return $origin_prop_type::get_key();
	}

	private function resolve_origin_prop_type( ?Component_Overridable_Prop $prop ) {
		if ( ! $prop ) {
			return null;
		}

		try {
			if ( $prop->origin_prop_fields ) {
				return Parsing_Utils::get_prop_type(
					$prop->origin_prop_fields['el_type'],
					$prop->origin_prop_fields['widget_type'],
					$prop->origin_prop_fields['prop_key']
				);
			}

			return Parsing_Utils::get_prop_type( $prop->el_type, $prop->widget_type, $prop->prop_key );
		} catch ( \Exception $e ) {
			return null;
		}
	}

	private function make_placeholder_element( int $component_id ): array {
		return [
			'elType'     => 'widget',
			'widgetType' => Component_Instance::get_element_type(),
			'elements'   => [],
			'settings'   => [
				'component_instance' => [
					'$$type' => 'component-instance',
					'value'  => [
						'component_id' => [ '$$type' => 'number', 'value' => $component_id ],
					],
				],
			],
		];
	}
}
