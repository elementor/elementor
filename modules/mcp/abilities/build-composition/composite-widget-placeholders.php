<?php

namespace Elementor\Modules\Mcp\Abilities\Build_Composition;

use Elementor\Modules\CompositeWidgets\Mcp\Widget_Instance_Expander;
use Elementor\Modules\Mcp\Abilities\Utils\Warnings_Bag;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * The composition's `<e-widget>` placeholders: kept as leaf tags until the composite widgets module's expander
 * replaces them with widget instances. Without the expander (experiment off) the tag is unknown, as before.
 */
final class Composite_Widget_Placeholders {

	private Xml_Parser $xml_parser;
	private ?Widget_Instance_Expander $expander;

	public function __construct( Xml_Parser $xml_parser, ?Widget_Instance_Expander $expander ) {
		$this->xml_parser = $xml_parser;
		$this->expander = $expander;
	}

	/**
	 * @return string[]
	 */
	public function get_tags(): array {
		return $this->expander ? [ Widget_Instance_Expander::TAG ] : [];
	}

	/**
	 * @return \WP_Error[] Pro features discovery errors of the removed placeholders.
	 */
	public function remove_unavailable( \DOMDocument $dom, array $element_config ): array {
		$errors = [];

		foreach ( $this->find_placeholders( $dom ) as $node ) {
			$config_id = $this->xml_parser->get_configuration_id( $node );

			if ( null === $config_id ) {
				continue;
			}

			$config = $element_config[ $config_id ] ?? [];
			$error = $this->expander->get_unavailable_error( is_array( $config ) ? $config : [] );

			if ( $error ) {
				$errors[] = $error;
				$this->xml_parser->remove_element( $node );
			}
		}

		return $errors;
	}

	/**
	 * A placeholder is found by its configuration-id, so one without it would be saved unexpanded.
	 *
	 * @return string[]
	 */
	public function collect_missing_configuration_id_errors( \DOMDocument $dom ): array {
		foreach ( $this->find_placeholders( $dom ) as $node ) {
			if ( '' === (string) $this->xml_parser->get_configuration_id( $node ) ) {
				/* translators: %s: XML tag name */
				return [ sprintf( __( 'Every <%s> needs a configuration-id.', 'elementor' ), Widget_Instance_Expander::TAG ) ];
			}
		}

		return [];
	}

	/**
	 * @param array<string, array&> $config_id_index
	 * @param array<string, mixed>  $element_config        Placeholders' entries are removed: they belong to the expander.
	 * @param string[]              $referenced_config_ids
	 */
	public function expand( array &$config_id_index, array &$element_config, array $referenced_config_ids, Warnings_Bag $warnings ): ?\WP_Error {
		if ( ! $this->expander ) {
			return null;
		}

		$placeholders = [];

		foreach ( array_keys( $config_id_index ) as $config_id ) {
			if ( ( $config_id_index[ $config_id ]['elType'] ?? null ) === Widget_Instance_Expander::TAG ) {
				$config = $element_config[ $config_id ] ?? [];
				$placeholders[ (string) $config_id ] = is_array( $config ) ? $config : [];
				unset( $element_config[ $config_id ] );
			}
		}

		if ( empty( $placeholders ) ) {
			return null;
		}

		$result = $this->expander->expand( $config_id_index, $placeholders, $referenced_config_ids );
		$warnings->merge( $result['warnings'] );

		return $result['error'];
	}

	/**
	 * Widget parts aren't tags in the XML, so their types are resolved here for the appliers' schemas.
	 *
	 * @param array[]              $subtrees
	 * @param array<string, array> $widget_configs
	 *
	 * @return array<string, array>
	 */
	public function add_type_configs( array $subtrees, array $widget_configs, Widget_Type_Resolver $type_resolver ): array {
		if ( ! $this->expander ) {
			return $widget_configs;
		}

		$stack = $subtrees;

		while ( ! empty( $stack ) ) {
			$node = array_pop( $stack );
			$type = $node['widgetType'] ?? $node['elType'] ?? null;

			if ( is_string( $type ) && ! isset( $widget_configs[ $type ] ) ) {
				$config = $type_resolver->resolve_type_config( $type );

				if ( ! is_wp_error( $config ) ) {
					$widget_configs[ $type ] = $config;
				}
			}

			foreach ( $node['elements'] ?? [] as $child ) {
				$stack[] = $child;
			}
		}

		return $widget_configs;
	}

	/**
	 * @return \DOMElement[]
	 */
	private function find_placeholders( \DOMDocument $dom ): array {
		if ( ! $this->expander ) {
			return [];
		}

		return array_values( array_filter(
			$this->xml_parser->iterate_all_descendants( $dom ),
			fn ( \DOMElement $node ) => Widget_Instance_Expander::TAG === $this->xml_parser->get_tag_name( $node )
		) );
	}
}
