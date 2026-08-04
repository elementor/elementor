<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers;

use Elementor\Core\Base\Document;
use Elementor\Modules\AtomicWidgets\PlainResolvers\Plain_Values_Resolver;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;
use Elementor\Modules\Components\Circular_Dependency_Validator;
use Elementor\Modules\Components\Components_Repository;
use Elementor\Modules\Components\Documents\Component as Component_Document;
use Elementor\Modules\Components\Documents\Component_Overridable_Prop;
use Elementor\Modules\Components\PropTypes\Component_Instance_Prop_Type;
use Elementor\Modules\Components\PropTypes\Component_Override_Parser;
use Elementor\Modules\Components\PropTypes\Override_Prop_Type;
use Elementor\Modules\Components\PropTypes\Overrides_Prop_Type;
use Elementor\Modules\Components\Utils\Parsing_Utils;
use Elementor\Modules\Components\Widgets\Component_Instance;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Component_Instance_Applier {

	private Components_Repository $repository;
	private Plain_Values_Resolver $plain_values_resolver;

	public function __construct( Components_Repository $repository, Plain_Values_Resolver $plain_values_resolver ) {
		$this->repository = $repository;
		$this->plain_values_resolver = $plain_values_resolver;
	}

	/**
	 * Builds the `component_instance` PropValue for each entry and writes it directly
	 * into `$node['settings']['component_instance']` — same side-effect shape as
	 * Style_Applier writing into `$node['styles']`.
	 *
	 * @param array<string, array&>                                                 $config_id_index      Index of subtree refs (from Subtree_Builder).
	 * @param array<string, array{component_id:int,overrides?:array<string,mixed>}> $component_instances  Per-config-id shorthand.
	 * @param Document|null                                                         $document             Target document, when one already exists.
	 * @return \WP_Error|null
	 */
	public function apply( array &$config_id_index, array $component_instances, ?Document $document ): ?\WP_Error {
		if ( empty( $component_instances ) ) {
			return null;
		}

		$errors = [];

		foreach ( $component_instances as $config_id => $shorthand ) {
			if ( ! isset( $config_id_index[ $config_id ] ) ) {
				$errors[] = sprintf( '[%s] configuration-id not found in xml_structure.', $config_id );
				continue;
			}

			$node = &$config_id_index[ $config_id ];

			if ( ( $node['widgetType'] ?? null ) !== Component_Instance::get_element_type() ) {
				$errors[] = sprintf(
					'[%s] component_instances entries are only valid for <e-component> elements (got "%s").',
					$config_id,
					$node['widgetType'] ?? ( $node['elType'] ?? 'unknown' )
				);
				continue;
			}

			if ( ! is_array( $shorthand ) ) {
				$errors[] = sprintf( '[%s] value must be an object with component_id and optional overrides.', $config_id );
				continue;
			}

			$envelope = $this->build_envelope( $config_id, $shorthand, $document, $errors );

			if ( null === $envelope ) {
				continue;
			}

			$node['settings'] = array_merge( $node['settings'] ?? [], [ 'component_instance' => $envelope ] );
		}
		unset( $node );

		if ( empty( $errors ) ) {
			return null;
		}

		return new \WP_Error(
			'elementor_invalid_component_instance',
			implode( ' ', $errors ),
			[ 'status' => \WP_Http::BAD_REQUEST ]
		);
	}

	private function build_envelope( string $config_id, array $shorthand, ?Document $document, array &$errors ): ?array {
		$component_id = (int) ( $shorthand['component_id'] ?? 0 );

		if ( ! $component_id ) {
			if ( isset( $shorthand['component_instance'] ) && is_array( $shorthand['component_instance'] ) ) {
				$errors[] = sprintf(
					'[%s] Invalid shape for <e-component> in element_config. Do not nest under "component_instance" — use the flat shape { "component_id": <int>, "overrides": { ... } } directly. See elementor/list-components.',
					$config_id
				);
			} else {
				$errors[] = sprintf( '[%s] component_id must be a non-zero integer.', $config_id );
			}

			return null;
		}

		$component = $this->repository->get( $component_id, false );

		if ( ! $component ) {
			$errors[] = sprintf( '[%s] Component %d not found.', $config_id, $component_id );
			return null;
		}

		if ( $component->get_is_archived() ) {
			$errors[] = sprintf( '[%s] Component %d is archived and cannot be placed.', $config_id, $component_id );
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

		$overridable_props = $component->get_overridable_props()->props;
		$raw_overrides = is_array( $shorthand['overrides'] ?? null ) ? $shorthand['overrides'] : [];

		$override_errors = $this->validate_override_keys( $config_id, $raw_overrides, $overridable_props );
		if ( ! empty( $override_errors ) ) {
			$errors = array_merge( $errors, $override_errors );
			return null;
		}

		return $this->assemble_envelope(
			$component_id,
			$this->build_overrides_value( $raw_overrides, $overridable_props, $component_id )
		);
	}

	/**
	 * Partial update entry-point for `manage-elements action=update` on `<e-component>` nodes.
	 *
	 * Contract (differs from apply()):
	 *  - `component_id` is optional; if omitted, recovered from the node's existing envelope.
	 *  - `overrides` is a **per-key merge** onto existing overrides.
	 *      * A supplied non-null value replaces (or appends) that override key.
	 *      * A supplied `null` value removes that override key from the envelope.
	 *      * Override keys not mentioned in the payload are preserved untouched.
	 *
	 * @param array<string, array&>                                                         $config_id_index
	 * @param array<string, array{component_id?:int, overrides?:array<string, mixed|null>}> $partial_shorthands
	 * @param Document                                                                      $document
	 */
	public function apply_partial( array &$config_id_index, array $partial_shorthands, Document $document ): ?\WP_Error {
		if ( empty( $partial_shorthands ) ) {
			return null;
		}

		$errors = [];

		foreach ( $partial_shorthands as $config_id => $shorthand ) {
			if ( ! isset( $config_id_index[ $config_id ] ) ) {
				$errors[] = sprintf( '[%s] configuration-id not found in xml_structure.', $config_id );
				continue;
			}

			$node = &$config_id_index[ $config_id ];

			if ( ( $node['widgetType'] ?? null ) !== Component_Instance::get_element_type() ) {
				$errors[] = sprintf(
					'[%s] apply_partial() is only valid for <e-component> elements (got "%s").',
					$config_id,
					$node['widgetType'] ?? ( $node['elType'] ?? 'unknown' )
				);
				continue;
			}

			if ( ! is_array( $shorthand ) ) {
				$errors[] = sprintf( '[%s] settings must be an object with optional component_id and overrides.', $config_id );
				continue;
			}

			$existing_settings = is_array( $node['settings'] ?? null ) ? $node['settings'] : [];

			$component_id = $this->resolve_component_id( $shorthand, $existing_settings );
			if ( ! $component_id ) {
				$errors[] = sprintf(
					'[%s] component_id could not be resolved. Either the target is not an existing <e-component> instance or component_id must be supplied.',
					$config_id
				);
				continue;
			}

			$component = $this->load_valid_component( $config_id, $component_id, $document, $errors );
			if ( ! $component ) {
				continue;
			}

			$overridable_props = $component->get_overridable_props()->props;
			$partial_overrides = is_array( $shorthand['overrides'] ?? null ) ? $shorthand['overrides'] : [];

			$key_errors = $this->validate_override_keys( $config_id, $partial_overrides, $overridable_props );
			if ( ! empty( $key_errors ) ) {
				$errors = array_merge( $errors, $key_errors );
				continue;
			}

			$existing_overrides_list = $this->extract_overrides_list( $existing_settings );
			$merged_overrides_list = $this->merge_overrides_list(
				$existing_overrides_list,
				$partial_overrides,
				$overridable_props,
				$component_id
			);

			$node['settings'] = array_merge(
				$node['settings'] ?? [],
				[ 'component_instance' => $this->assemble_envelope( $component_id, $merged_overrides_list ) ]
			);
		}
		unset( $node );

		if ( empty( $errors ) ) {
			return null;
		}

		return new \WP_Error(
			'elementor_invalid_component_instance',
			implode( ' ', $errors ),
			[ 'status' => \WP_Http::BAD_REQUEST ]
		);
	}

	private function assemble_envelope( int $component_id, array $overrides_list ): array {
		return [
			'$$type' => Component_Instance_Prop_Type::get_key(),
			'value'  => [
				'component_id' => [
					'$$type' => Number_Prop_Type::get_key(),
					'value' => $component_id,
				],
				'overrides'    => [
					'$$type' => Overrides_Prop_Type::get_key(),
					'value'  => $overrides_list,
				],
			],
		];
	}

	private function resolve_component_id( array $shorthand, array $existing_settings ): int {
		$supplied = (int) ( $shorthand['component_id'] ?? 0 );

		if ( $supplied ) {
			return $supplied;
		}

		return (int) Component_Instance_Prop_Type::extract_component_id( $existing_settings );
	}

	private function extract_overrides_list( array $existing_settings ): array {
		$list = $existing_settings['component_instance']['value']['overrides']['value'] ?? [];

		return is_array( $list ) ? $list : [];
	}

	private function merge_overrides_list( array $existing_list, array $partial_overrides, array $overridable_props, int $component_id ): array {
		$updates = [];
		$deletions = [];
		foreach ( $partial_overrides as $key => $value ) {
			if ( null === $value ) {
				$deletions[ $key ] = true;
			} else {
				$updates[ $key ] = $value;
			}
		}

		$new_items = $this->build_overrides_value( $updates, $overridable_props, $component_id );
		$new_items_by_key = [];
		foreach ( $new_items as $item ) {
			$key = $item['value']['override_key'] ?? null;
			if ( is_string( $key ) && '' !== $key ) {
				$new_items_by_key[ $key ] = $item;
			}
		}

		$merged = [];
		foreach ( $existing_list as $item ) {
			$key = $item['value']['override_key'] ?? null;
			if ( ! is_string( $key ) || '' === $key ) {
				$merged[] = $item;
				continue;
			}
			if ( isset( $deletions[ $key ] ) ) {
				continue;
			}
			if ( isset( $new_items_by_key[ $key ] ) ) {
				$merged[] = $new_items_by_key[ $key ];
				unset( $new_items_by_key[ $key ] );
				continue;
			}
			$merged[] = $item;
		}

		foreach ( $new_items_by_key as $item ) {
			$merged[] = $item;
		}

		return $merged;
	}

	private function load_valid_component( string $config_id, int $component_id, Document $document, array &$errors ) {
		$component = $this->repository->get( $component_id, false );

		if ( ! $component ) {
			$errors[] = sprintf( '[%s] Component %d not found.', $config_id, $component_id );
			return null;
		}

		if ( $component->get_is_archived() ) {
			$errors[] = sprintf( '[%s] Component %d is archived and cannot be placed.', $config_id, $component_id );
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

		return $component;
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

			$overrides[] = [
				'$$type' => Override_Prop_Type::get_key(),
				'value'  => [
					'override_key'   => $override_key,
					'override_value' => $this->resolve_override_value( $raw_value, $prop ),
					'schema_source'  => [
						'type' => Component_Override_Parser::get_override_type(),
						'id' => $component_id,
					],
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

		if ( ! $origin_prop_type instanceof Prop_Type ) {
			return $raw_value;
		}

		$resolved = $this->plain_values_resolver->resolve( $raw_value, $origin_prop_type );

		return $resolved ?? $raw_value;
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
				'component_instance' => $this->assemble_envelope( $component_id, [] ),
			],
		];
	}
}
