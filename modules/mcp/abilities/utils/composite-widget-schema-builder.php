<?php

namespace Elementor\Modules\Mcp\Abilities\Utils;

use Elementor\Modules\AtomicWidgets\Elements\Base\Widget_Markers;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\CompositeWidgets\Definitions\Validation\Template_Rules;
use Elementor\Modules\CompositeWidgets\Definitions\Widgets_Definitions_Registry;
use Elementor\Modules\CompositeWidgets\Module as Composite_Widgets_Module;
use Elementor\Modules\GlobalClasses\Utils\Atomic_Elements_Utils;
use Elementor\Modules\Mcp\Abilities\Appliers\Widget_Instance_Applier;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * The agent's view of a composite widget definition: its parts (each configured through its own
 * `<configuration-id>.<part>` key) and the definition's `general` fields with the target prop's schema.
 */
class Composite_Widget_Schema_Builder {

	const EXAMPLE_CONFIGURATION_ID = 'my-widget';

	public static function build( array $definition ): array {
		$parts = self::collect_parts( $definition['template'] );

		return [
			'id' => $definition['id'],
			'title' => $definition['title'] ?? $definition['id'],
			'source' => $definition['source'],
			'version' => $definition['version'],
			'archived' => ! empty( $definition[ Widgets_Definitions_Registry::ARCHIVED_KEY ] ),
			'insertable' => Composite_Widgets_Module::can_insert( $definition ),
			'parts' => $parts,
			'fields' => self::build_fields( $definition['general'] ?? [], $parts ),
			'allowed_part_types' => Template_Rules::get_allowed_types(),
			'usage' => self::build_usage( $definition['id'], $parts ),
		];
	}

	public static function build_summary( array $definition ): array {
		return [
			'id' => $definition['id'],
			'title' => $definition['title'] ?? $definition['id'],
		];
	}

	/**
	 * Slot content isn't part of the widget, so the walk stops at a slot.
	 *
	 * @return array<string, array{type: string, slot?: true}>
	 */
	private static function collect_parts( array $node ): array {
		$parts = [];
		$part = $node[ Widget_Markers::PART_KEY ] ?? null;
		$is_slot = ! empty( $node[ Widget_Markers::SLOT_KEY ] );

		if ( is_string( $part ) && '' !== $part ) {
			$parts[ $part ] = [ 'type' => self::get_element_type( $node ) ];

			if ( $is_slot ) {
				$parts[ $part ]['slot'] = true;
			}
		}

		if ( $is_slot ) {
			return $parts;
		}

		foreach ( $node['elements'] ?? [] as $child ) {
			$parts += self::collect_parts( $child );
		}

		return $parts;
	}

	/**
	 * Repeaters aren't supported by MCP yet, so only section fields and field groups are listed.
	 */
	private static function build_fields( array $general, array $parts ): array {
		$fields = [];

		foreach ( $general as $section ) {
			if ( ! isset( $section['section'], $section['fields'] ) || ! is_array( $section['fields'] ) ) {
				continue;
			}

			foreach ( $section['fields'] as $entry ) {
				$group_fields = isset( $entry['target'] ) ? [ $entry ] : ( $entry['fields'] ?? [] );

				foreach ( $group_fields as $field ) {
					$fields[] = self::build_field( $section['section'], $field, $parts );
				}
			}
		}

		return $fields;
	}

	private static function build_field( string $section, array $field, array $parts ): array {
		$part = $field['target']['part'];
		$prop = $field['target']['prop'];

		return [
			'section' => $section,
			'label' => $field['label'],
			'target' => [
				'part' => $part,
				'prop' => $prop,
			],
			'schema' => self::build_prop_schema( $parts[ $part ]['type'] ?? null, $prop ),
		];
	}

	private static function build_prop_schema( ?string $element_type, string $prop ): ?array {
		$element = $element_type ? Atomic_Elements_Utils::get_element_instance( $element_type ) : null;

		if ( ! $element || ! method_exists( $element, 'get_props_schema' ) ) {
			return null;
		}

		$prop_type = $element::get_props_schema()[ $prop ] ?? null;

		return $prop_type instanceof Prop_Type
			? Widget_Context_Helper::build_published_property_schema( $prop, $prop_type, $element_type )
			: null;
	}

	private static function build_usage( string $widget_id, array $parts ): array {
		$example_part = array_key_last( $parts ) ?? 'part_name';

		return [
			'xml_structure' => sprintf( '<%s configuration-id="%s"/>', Widget_Instance_Applier::WIDGET_TAG, self::EXAMPLE_CONFIGURATION_ID ),
			'element_config' => [
				self::EXAMPLE_CONFIGURATION_ID => [ Widget_Instance_Applier::WIDGET_ID_KEY => $widget_id ],
			],
			'part_key' => Widget_Instance_Applier::get_part_configuration_id( self::EXAMPLE_CONFIGURATION_ID, $example_part ),
		];
	}

	private static function get_element_type( array $node ): string {
		return Template_Rules::WIDGET_EL_TYPE === ( $node['elType'] ?? null )
			? (string) ( $node['widgetType'] ?? '' )
			: (string) ( $node['elType'] ?? '' );
	}
}
