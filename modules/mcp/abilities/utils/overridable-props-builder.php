<?php

namespace Elementor\Modules\Mcp\Abilities\Utils;

use Elementor\Modules\Components\PropTypes\Overridable_Prop_Type;
use Elementor\Modules\Components\Utils\Parsing_Utils;

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
 *         'target'    => '<element id>',
 *         'prop_key'  => '<setting key on that element>',
 *         'label'     => '<human label>',
 *         'group'     => '<optional group label, defaults to "Default">',
 *     ],
 * ]
 * ```
 */
class Overridable_Props_Builder {

	const DEFAULT_GROUP_LABEL = 'Default';
	const FALLBACK_GROUP_ID = 'group';

	public static function make(): self {
		return new self();
	}

	/**
	 * @param array $elements       Elements tree containing the referenced target ids. Mutated in place:
	 *                              each referenced element's setting is rewritten into an `overridable` envelope.
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
				[ 'status' => \WP_Http::BAD_REQUEST ]
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
		if ( ! is_array( $definition ) ) {
			return new \WP_Error( 'x', sprintf( '[%s] overridable_props entry must be an object.', $override_key ) );
		}

		$target = $definition['target'] ?? null;
		$prop_key = $definition['prop_key'] ?? null;
		$label = $definition['label'] ?? null;
		$group_label = is_string( $definition['group'] ?? null ) && '' !== $definition['group']
			? $definition['group']
			: self::DEFAULT_GROUP_LABEL;

		if ( ! is_string( $target ) || '' === $target || ! is_string( $prop_key ) || '' === $prop_key || ! is_string( $label ) || '' === $label ) {
			return new \WP_Error( 'x', sprintf( '[%s] overridable_props entries require a non-empty target, prop_key, and label.', $override_key ) );
		}

		$element = &$this->find_element_ref( $elements, $target );

		if ( null === $element ) {
			return new \WP_Error( 'x', sprintf( '[%s] target "%s" was not found in the element tree.', $override_key, $target ) );
		}

		$el_type = (string) ( $element['elType'] ?? '' );
		$widget_type = (string) ( $element['widgetType'] ?? '' );

		try {
			$prop_type = Parsing_Utils::get_prop_type( $el_type, $widget_type, $prop_key );
		} catch ( \Exception $e ) {
			return new \WP_Error( 'x', sprintf( '[%s] %s', $override_key, $e->getMessage() ) );
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
			'elementId' => $target,
			'elType' => $el_type,
			'widgetType' => $widget_type,
			'propKey' => $prop_key,
			'originValue' => $origin_value,
			'groupId' => $group_id,
		];
	}

	private function resolve_group_id( string $label, array &$group_ids_by_label, array &$groups, array &$group_order ): string {
		if ( isset( $group_ids_by_label[ $label ] ) ) {
			return $group_ids_by_label[ $label ];
		}

		$sanitized_label = sanitize_key( $label );
		$group_id = $this->unique_group_id( '' === $sanitized_label ? self::FALLBACK_GROUP_ID : $sanitized_label, $groups );

		$group_ids_by_label[ $label ] = $group_id;
		$groups[ $group_id ] = [
			'id' => $group_id,
			'label' => $label,
			'props' => [],
		];
		$group_order[] = $group_id;

		return $group_id;
	}

	private function unique_group_id( string $base, array $groups ): string {
		if ( ! isset( $groups[ $base ] ) ) {
			return $base;
		}

		$suffix = 2;
		while ( isset( $groups[ $base . '-' . $suffix ] ) ) {
			++$suffix;
		}

		return $base . '-' . $suffix;
	}

	/**
	 * @return array|null
	 */
	private function &find_element_ref( array &$elements, string $id ) {
		$not_found = null;

		foreach ( $elements as &$element ) {
			if ( ( $element['id'] ?? null ) === $id ) {
				return $element;
			}

			if ( ! empty( $element['elements'] ) && is_array( $element['elements'] ) ) {
				$found = &$this->find_element_ref( $element['elements'], $id );

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
