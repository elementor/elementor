<?php

namespace Elementor\Modules\Mcp\Abilities\Utils;

use Elementor\Modules\Components\Components_Repository;
use Elementor\Modules\Components\Documents\Component_Overridable_Prop;
use Elementor\Modules\Components\PropTypes\Component_Override_Parser;
use Elementor\Modules\Components\PropTypes\Overridable_Prop_Type;
use Elementor\Modules\Components\PropTypes\Override_Prop_Type;
use Elementor\Modules\Components\PropTypes\Overrides_Prop_Type;
use Elementor\Modules\Components\Utils\Parsing_Utils;
use Elementor\Modules\Components\Widgets\Component_Instance;
use WP_Http;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Enriches a friendly, LLM-authorable overridable-props input into the native
 * `{ props, groups }` shape expected by `Component_Overridable_Props_Parser`,
 * and rewrites the referenced element settings into `overridable` envelopes.
 *
 * Friendly input shape:
 * ```
 * [
 *     '<override-key>' => [
 *         'target'    => '<element id, or the configuration-id the element was compiled from>',
 *         'prop_key'  => '<setting key on that element (raw widget target)
 *                          OR nested override key exposed by the target component (e-component target)>',
 *         'label'     => '<human label>',
 *         'group'     => '<optional group label, defaults to "Default">',
 *     ],
 * ]
 * ```
 *
 * When `target` is an `<e-component>` instance, the builder switches to the "expose further" flow:
 * it reads the inner component's own `overridable_props`, threads any pre-existing `originPropFields`
 * through for multi-hop composition, and splices an `overridable → override` envelope into the nested
 * instance's `component_instance.value.overrides` list — matching what the editor's expose-further UI
 * produces on save. Any override already addressing that inner key is absorbed into the envelope rather
 * than left beside it, so a per-instance value set via `element_config` survives being exposed.
 */
class Overridable_Props_Builder {

	const DEFAULT_GROUP_LABEL = 'Default';
	const GROUP_ID_PREFIX = 'group';
	const GROUP_ID_SUFFIX_LENGTH = 7;

	private ?Components_Repository $repository;

	public function __construct( ?Components_Repository $repository = null ) {
		$this->repository = $repository;
	}

	public static function make( ?Components_Repository $repository = null ): self {
		return new self( $repository );
	}

	/**
	 * @param array $elements       Elements tree containing the referenced target ids. Mutated in place:
	 *                              each referenced element's setting is rewritten into an `overridable` envelope
	 *                              (raw widget target) or spliced into `component_instance.value.overrides`
	 *                              (`<e-component>` target).
	 * @param array $friendly_props Friendly overridable-props input, keyed by override key.
	 *
	 * @return array{props: array, groups: array{items: array, order: array}}|\WP_Error
	 */
	public function build( array &$elements, array $friendly_props ) {
		if ( empty( $friendly_props ) ) {
			return [
				'props' => [],
				'groups' => [
					'items' => [],
					'order' => [],
				],
			];
		}

		$props = [];
		$groups = [];
		$group_order = [];
		$group_ids_by_label = [];
		$errors = [];

		foreach ( $friendly_props as $override_key => $definition ) {
			$prop = $this->build_prop( (string) $override_key, $definition, $elements, $group_ids_by_label, $groups, $group_order );

			if ( is_wp_error( $prop ) ) {
				$errors[] = $prop->get_error_message();
				continue;
			}

			$props[ $override_key ] = $prop;
		}

		if ( ! empty( $errors ) ) {
			return new \WP_Error(
				'invalid_overridable_props',
				implode( ' ', $errors ),
				[ 'status' => WP_Http::BAD_REQUEST ]
			);
		}

		return [
			'props' => $props,
			'groups' => [
				'items' => $groups,
				'order' => $group_order,
			],
		];
	}

	/**
	 * @return array|\WP_Error
	 */
	private function build_prop(
		string $override_key,
		$definition,
		array &$elements,
		array &$group_ids_by_label,
		array &$groups,
		array &$group_order
	) {
		$common = $this->validate_common_definition( $override_key, $definition );
		if ( is_wp_error( $common ) ) {
			return $common;
		}
		[ 'target' => $target, 'prop_key' => $prop_key, 'label' => $label, 'group_label' => $group_label ] = $common;

		$element = &$this->find_element_ref( $elements, $target );

		if ( null === $element ) {
			return $this->invalid_definition( sprintf( '[%s] target "%s" was not found in the element tree.', $override_key, $target ) );
		}

		$widget_type = (string) ( $element['widgetType'] ?? '' );

		if ( Component_Instance::get_element_type() === $widget_type ) {
			return $this->build_nested_component_prop(
				$override_key,
				$prop_key,
				$label,
				$group_label,
				$element,
				$group_ids_by_label,
				$groups,
				$group_order
			);
		}

		return $this->build_raw_widget_prop(
			$override_key,
			$prop_key,
			$label,
			$group_label,
			$element,
			$group_ids_by_label,
			$groups,
			$group_order
		);
	}

	/**
	 * @return array{target: string, prop_key: string, label: string, group_label: string}|\WP_Error
	 */
	private function validate_common_definition( string $override_key, $definition ) {
		if ( ! is_array( $definition ) ) {
			return $this->invalid_definition( sprintf( '[%s] overridable_props entry must be an object.', $override_key ) );
		}

		if ( sanitize_key( $override_key ) !== $override_key ) {
			return $this->invalid_definition( sprintf( '[%s] override keys must be slugs: lowercase letters, digits, dashes and underscores only.', $override_key ) );
		}

		$target = $definition['target'] ?? null;
		$prop_key = $definition['prop_key'] ?? null;
		$label = $definition['label'] ?? null;
		$group_label = is_string( $definition['group'] ?? null ) && '' !== $definition['group']
			? $definition['group']
			: self::DEFAULT_GROUP_LABEL;

		if ( ! is_string( $target ) || '' === $target || ! is_string( $prop_key ) || '' === $prop_key || ! is_string( $label ) || '' === $label ) {
			return $this->invalid_definition( sprintf( '[%s] overridable_props entries require a non-empty target, prop_key, and label.', $override_key ) );
		}

		return [
			'target' => $target,
			'prop_key' => $prop_key,
			'label' => $label,
			'group_label' => $group_label,
		];
	}

	/**
	 * @return array|\WP_Error
	 */
	private function build_raw_widget_prop(
		string $override_key,
		string $prop_key,
		string $label,
		string $group_label,
		array &$element,
		array &$group_ids_by_label,
		array &$groups,
		array &$group_order
	) {
		$el_type = (string) ( $element['elType'] ?? '' );
		$widget_type = (string) ( $element['widgetType'] ?? '' );

		try {
			$prop_type = Parsing_Utils::get_prop_type( $el_type, $widget_type, $prop_key );
		} catch ( \Exception $e ) {
			return $this->invalid_definition( sprintf( '[%s] %s', $override_key, $e->getMessage() ) );
		}

		$origin_value = $element['settings'][ $prop_key ] ?? $prop_type->get_default();

		$element['settings'][ $prop_key ] = [
			'$$type' => Overridable_Prop_Type::get_key(),
			'value' => [
				'override_key' => $override_key,
				'origin_value' => $origin_value,
			],
		];

		$group_id = $this->resolve_group_id( $group_label, $group_ids_by_label, $groups, $group_order );
		$groups[ $group_id ]['props'][] = $override_key;

		return [
			'overrideKey' => $override_key,
			'label' => $label,
			'elementId' => (string) $element['id'],
			'elType' => $el_type,
			'widgetType' => $this->resolve_widgets_cache_key( $el_type, $widget_type ),
			'propKey' => $prop_key,
			'originValue' => $origin_value,
			'groupId' => $group_id,
		];
	}

	/**
	 * Expose-further path. `$prop_key` names the **inner component's** exposed override key,
	 * not a real setting key on the `<e-component>` element (which only has `component_instance`).
	 *
	 * @return array|\WP_Error
	 */
	private function build_nested_component_prop(
		string $override_key,
		string $inner_override_key,
		string $label,
		string $group_label,
		array &$element,
		array &$group_ids_by_label,
		array &$groups,
		array &$group_order
	) {
		$inner_component_id = $this->extract_inner_component_id( $element );

		if ( null === $inner_component_id ) {
			return new \WP_Error(
				'invalid_overridable_prop_definition',
				sprintf(
					'[%s] target "%s" is an <e-component> instance but has no valid component_instance settings. Set component_id on the instance (via element_config) before exposing an override through it.',
					$override_key,
					(string) ( $element['id'] ?? '' )
				)
			);
		}

		$inner_component = $this->get_repository()->get( $inner_component_id, false );

		if ( ! $inner_component ) {
			return new \WP_Error(
				'x',
				sprintf( '[%s] inner component %d referenced by target "%s" was not found.', $override_key, $inner_component_id, (string) $element['id'] )
			);
		}

		$inner_props = $inner_component->get_overridable_props()->props;
		$inner_prop = $inner_props[ $inner_override_key ] ?? null;

		if ( ! $inner_prop ) {
			$available = empty( $inner_props ) ? '(none)' : implode( ', ', array_keys( $inner_props ) );
			return new \WP_Error(
				'x',
				sprintf(
					'[%s] component %d has no exposed override "%s". Available: %s. Use one of these as prop_key when the target is an <e-component>, or expose the underlying raw widget on the inner component first.',
					$override_key,
					$inner_component_id,
					$inner_override_key,
					$available
				)
			);
		}

		$origin_prop_fields = $this->resolve_origin_prop_fields( $inner_prop );

		$inner_override_value = $this->take_existing_override_value( $element, $inner_override_key );

		$override_envelope = $this->build_override_envelope( $inner_override_key, $inner_component_id, $inner_override_value );

		$overridable_envelope = [
			'$$type' => Overridable_Prop_Type::get_key(),
			'value' => [
				'override_key' => $override_key,
				'origin_value' => $override_envelope,
			],
		];

		$this->upsert_component_instance_override( $element, $override_key, $overridable_envelope );

		$group_id = $this->resolve_group_id( $group_label, $group_ids_by_label, $groups, $group_order );
		$groups[ $group_id ]['props'][] = $override_key;

		return [
			'overrideKey' => $override_key,
			'label' => $label,
			'elementId' => (string) $element['id'],
			'elType' => 'widget',
			'widgetType' => Component_Instance::get_element_type(),
			'propKey' => $inner_override_key,
			'originValue' => $inner_override_value,
			'groupId' => $group_id,
			'originPropFields' => $origin_prop_fields,
		];
	}

	private function extract_inner_component_id( array $element ): ?int {
		$raw = $element['settings']['component_instance']['value']['component_id']['value'] ?? null;

		if ( ! is_numeric( $raw ) || (int) $raw <= 0 ) {
			return null;
		}

		return (int) $raw;
	}

	/**
	 * N-level chaining: if the inner overridable prop is itself a chained expose (already carries
	 * `origin_prop_fields`), thread those through so the outer entry points all the way at the raw
	 * widget's schema. Otherwise, derive the fields from the inner prop's own element metadata.
	 */
	private function resolve_origin_prop_fields( Component_Overridable_Prop $inner_prop ): array {
		if ( $inner_prop->origin_prop_fields ) {
			return [
				'elType' => (string) $inner_prop->origin_prop_fields['el_type'],
				'widgetType' => (string) $inner_prop->origin_prop_fields['widget_type'],
				'propKey' => (string) $inner_prop->origin_prop_fields['prop_key'],
				'elementId' => (string) $inner_prop->origin_prop_fields['element_id'],
			];
		}

		return [
			'elType' => (string) $inner_prop->el_type,
			'widgetType' => (string) $inner_prop->widget_type,
			'propKey' => (string) $inner_prop->prop_key,
			'elementId' => (string) $inner_prop->element_id,
		];
	}

	/**
	 * @param string     $inner_override_key   Override key exposed by the inner component.
	 * @param int        $inner_component_id   Component the inner override key belongs to.
	 * @param array|null $inner_override_value Per-instance value for the inner override, or null to inherit
	 *                                         the inner component's own origin value.
	 */
	private function build_override_envelope( string $inner_override_key, int $inner_component_id, ?array $inner_override_value ): array {
		return [
			'$$type' => Override_Prop_Type::get_key(),
			'value' => [
				'override_key' => $inner_override_key,
				'override_value' => $inner_override_value,
				'schema_source' => [
					'type' => Component_Override_Parser::get_override_type(),
					'id' => $inner_component_id,
				],
			],
		];
	}

	/**
	 * Both a literal `override` (placed via `element_config`) and the `overridable` envelope we are about to
	 * write address the nested instance by the same inner override key. Two entries for one key make the
	 * resolvers last-write-wins, silently discarding whichever came first, so the existing entry is consumed
	 * here: its value moves into the new envelope's `override_value` and the old entry is dropped.
	 *
	 * @return array|null The value carried by the removed entry, or null when there was none.
	 */
	private function take_existing_override_value( array &$element, string $inner_override_key ): ?array {
		$this->ensure_component_instance_shape( $element );

		$overrides_list = &$element['settings']['component_instance']['value']['overrides']['value'];
		$taken_value = null;

		foreach ( $overrides_list as $index => $existing ) {
			if ( $inner_override_key !== $this->resolve_inner_override_key( $existing ) ) {
				continue;
			}

			$taken_value = $this->resolve_inner_override_value( $existing );
			unset( $overrides_list[ $index ] );
		}

		$overrides_list = array_values( $overrides_list );

		return $taken_value;
	}

	/**
	 * An entry addresses the nested instance either directly (`override`) or through an already-exposed
	 * wrapper (`overridable` whose `origin_value` is the `override`).
	 */
	private function resolve_inner_override( $entry ): ?array {
		if ( ! is_array( $entry ) ) {
			return null;
		}

		if ( Overridable_Prop_Type::get_key() === ( $entry['$$type'] ?? null ) ) {
			$entry = $entry['value']['origin_value'] ?? null;
		}

		if ( ! is_array( $entry ) || Override_Prop_Type::get_key() !== ( $entry['$$type'] ?? null ) ) {
			return null;
		}

		return $entry;
	}

	private function resolve_inner_override_key( $entry ): ?string {
		$override = $this->resolve_inner_override( $entry );

		return isset( $override['value']['override_key'] ) ? (string) $override['value']['override_key'] : null;
	}

	private function resolve_inner_override_value( $entry ): ?array {
		$override = $this->resolve_inner_override( $entry );
		$value = $override['value']['override_value'] ?? null;

		return is_array( $value ) ? $value : null;
	}

	/**
	 * Replace-or-append semantics on the nested instance's `overrides` list, keyed by the outer
	 * override_key stored on the `Overridable_Prop_Type` envelope — mirrors how the editor's
	 * `getMatchingOverride`/`setInstanceValue` flow keys entries when the user re-edits an
	 * exposed-further prop.
	 */
	private function upsert_component_instance_override( array &$element, string $override_key, array $overridable_envelope ): void {
		$this->ensure_component_instance_shape( $element );

		$overrides_list = &$element['settings']['component_instance']['value']['overrides']['value'];

		foreach ( $overrides_list as $index => $existing ) {
			$is_overridable = ( $existing['$$type'] ?? null ) === Overridable_Prop_Type::get_key();
			$existing_key = $existing['value']['override_key'] ?? null;

			if ( $is_overridable && $existing_key === $override_key ) {
				$overrides_list[ $index ] = $overridable_envelope;
				return;
			}
		}

		$overrides_list[] = $overridable_envelope;
	}

	private function ensure_component_instance_shape( array &$element ): void {
		if ( ! isset( $element['settings']['component_instance']['value']['overrides'] ) ) {
			$element['settings']['component_instance']['value']['overrides'] = [
				'$$type' => Overrides_Prop_Type::get_key(),
				'value' => [],
			];
			return;
		}

		if ( ! isset( $element['settings']['component_instance']['value']['overrides']['value'] )
			|| ! is_array( $element['settings']['component_instance']['value']['overrides']['value'] ) ) {
			$element['settings']['component_instance']['value']['overrides']['value'] = [];
		}
	}

	private function get_repository(): Components_Repository {
		if ( ! $this->repository ) {
			$this->repository = new Components_Repository();
		}

		return $this->repository;
	}

	private function invalid_definition( string $message ): \WP_Error {
		return new \WP_Error( 'invalid_overridable_prop_definition', $message );
	}

	/**
	 * The editor's `getWidgetsCache()` is keyed by the atomic widget/element type name (e.g. `e-heading`,
	 * `e-flexbox`). Widgets carry it on `widgetType`; atomic elements carry it on `elType` and leave
	 * `widgetType` unset. `OverrideControl` looks the persisted `widgetType` up in the cache to find the
	 * origin prop type — it must be a real cache key, or the panel throws "Prop type not found".
	 */
	private function resolve_widgets_cache_key( string $el_type, string $widget_type ): string {
		return '' !== $widget_type ? $widget_type : $el_type;
	}

	private function resolve_group_id( string $label, array &$group_ids_by_label, array &$groups, array &$group_order ): string {
		if ( isset( $group_ids_by_label[ $label ] ) ) {
			return $group_ids_by_label[ $label ];
		}

		$group_id = $this->generate_group_id();

		$group_ids_by_label[ $label ] = $group_id;
		$groups[ $group_id ] = [
			'id' => $group_id,
			'label' => $label,
			'props' => [],
		];
		$group_order[] = $group_id;

		return $group_id;
	}

	/**
	 * Mirrors the editor's `generateUniqueId( 'group' )` format. Group ids must not be derived from the
	 * label: `@elementor/ui`'s `SortableGroup` treats the id "default" as "no group id" and hands the
	 * whole multi-group map back to the props panel, which then crashes on `items.map`.
	 */
	private function generate_group_id(): string {
		return sprintf(
			'%s-%d-%s',
			self::GROUP_ID_PREFIX,
			(int) round( microtime( true ) * 1000 ),
			strtolower( wp_generate_password( self::GROUP_ID_SUFFIX_LENGTH, false, false ) )
		);
	}

	/**
	 * Matches the persisted element id, or the configuration-id the element was compiled from —
	 * compiled trees get machine-generated ids, so the caller can only address them by the
	 * configuration-id it already used in `xml_structure`.
	 *
	 * @return array|null
	 */
	private function &find_element_ref( array &$elements, string $target ) {
		$not_found = null;

		foreach ( $elements as &$element ) {
			$configuration_id = $element['editor_settings']['title'] ?? null;

			if ( ( $element['id'] ?? null ) === $target || $configuration_id === $target ) {
				return $element;
			}

			if ( ! empty( $element['elements'] ) && is_array( $element['elements'] ) ) {
				$found = &$this->find_element_ref( $element['elements'], $target );

				if ( null !== $found ) {
					unset( $element );
					return $found;
				}
			}
		}
		unset( $element );

		return $not_found;
	}
}
