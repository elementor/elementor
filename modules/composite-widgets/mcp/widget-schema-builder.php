<?php

namespace Elementor\Modules\CompositeWidgets\Mcp;

use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\CompositeWidgets\Definitions\Widgets_Definitions_Registry;
use Elementor\Modules\CompositeWidgets\Instance\Template_Parts;
use Elementor\Modules\CompositeWidgets\Module;
use Elementor\Modules\GlobalClasses\Utils\Atomic_Elements_Utils;
use Elementor\Modules\Mcp\Abilities\Utils\Widget_Context_Helper;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * The agent's view of a definition: its parts, and the `general` fields with the target prop's plain JSON schema.
 */
class Widget_Schema_Builder {
	public static function build( array $definition ): array {
		$parts = Template_Parts::describe( $definition['template'] );

		return [
			'id' => $definition['id'],
			'title' => $definition['title'] ?? $definition['id'],
			'source' => $definition['source'],
			'version' => $definition['version'],
			'archived' => ! empty( $definition[ Widgets_Definitions_Registry::ARCHIVED_KEY ] ),
			'insertable' => Module::can_insert( $definition ),
			'parts' => $parts,
			'fields' => self::build_fields( $definition['general'] ?? [], $parts ),
		];
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
		$target = $field['target'];

		return [
			'section' => $section,
			'label' => $field['label'],
			'target' => [
				'part' => $target['part'],
				'prop' => $target['prop'],
			],
			'schema' => self::build_prop_schema( $parts[ $target['part'] ]['type'] ?? null, $target['prop'] ),
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
}
