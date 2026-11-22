<?php

namespace Elementor\Modules\Mcp\Abilities\Build_Composition;

use Elementor\Modules\Mcp\Abilities\Utils\Warnings_Bag;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * The composition's `Composition_Tag_Expander`s: placeholder tags that a module turns into elements.
 */
final class Tag_Expanders {

	const FILTER = 'elementor/mcp/composition/tag-expanders';

	private Xml_Parser $xml_parser;

	/** @var array<string, Composition_Tag_Expander> */
	private array $expanders;

	/**
	 * @param Xml_Parser                              $xml_parser
	 * @param array<string, Composition_Tag_Expander> $expanders Tag => expander.
	 */
	private function __construct( Xml_Parser $xml_parser, array $expanders ) {
		$this->xml_parser = $xml_parser;
		$this->expanders = $expanders;
	}

	public static function from_filter( Xml_Parser $xml_parser ): self {
		$expanders = [];

		foreach ( (array) apply_filters( self::FILTER, [] ) as $expander ) {
			if ( $expander instanceof Composition_Tag_Expander ) {
				$expanders[ $expander->get_tag() ] = $expander;
			}
		}

		return new self( $xml_parser, $expanders );
	}

	/**
	 * @return string[]
	 */
	public function get_tags(): array {
		return array_keys( $this->expanders );
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
			$error = $this->expanders[ $this->xml_parser->get_tag_name( $node ) ]->get_unavailable_error( is_array( $config ) ? $config : [] );

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
		$errors = [];

		foreach ( $this->find_placeholders( $dom ) as $node ) {
			if ( '' === (string) $this->xml_parser->get_configuration_id( $node ) ) {
				/* translators: %s: XML tag name */
				$errors[] = sprintf( __( 'Every <%s> needs a configuration-id.', 'elementor' ), $this->xml_parser->get_tag_name( $node ) );
			}
		}

		return array_values( array_unique( $errors ) );
	}

	/**
	 * @param array<string, array&> $config_id_index
	 * @param array<string, mixed>  $element_config        Placeholders' entries are removed: they belong to the expander.
	 * @param string[]              $referenced_config_ids
	 */
	public function expand( array &$config_id_index, array &$element_config, array $referenced_config_ids, Warnings_Bag $warnings ): ?\WP_Error {
		foreach ( $this->expanders as $tag => $expander ) {
			$placeholders = [];

			foreach ( array_keys( $config_id_index ) as $config_id ) {
				if ( ( $config_id_index[ $config_id ]['elType'] ?? null ) === $tag ) {
					$config = $element_config[ $config_id ] ?? [];
					$placeholders[ (string) $config_id ] = is_array( $config ) ? $config : [];
					unset( $element_config[ $config_id ] );
				}
			}

			if ( empty( $placeholders ) ) {
				continue;
			}

			$result = $expander->expand( $config_id_index, $placeholders, $referenced_config_ids );

			if ( $result['error'] ) {
				return $result['error'];
			}

			$warnings->merge( $result['warnings'] );
		}

		return null;
	}

	/**
	 * Expanded elements aren't tags in the XML, so their types are resolved here for the appliers' schemas.
	 *
	 * @param array[]              $subtrees
	 * @param array<string, array> $widget_configs
	 *
	 * @return array<string, array>
	 */
	public function add_type_configs( array $subtrees, array $widget_configs, Widget_Type_Resolver $type_resolver ): array {
		if ( empty( $this->expanders ) ) {
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
		if ( empty( $this->expanders ) ) {
			return [];
		}

		return array_values( array_filter(
			$this->xml_parser->iterate_all_descendants( $dom ),
			fn ( \DOMElement $node ) => isset( $this->expanders[ $this->xml_parser->get_tag_name( $node ) ] )
		) );
	}
}
