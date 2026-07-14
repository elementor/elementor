<?php

namespace Elementor\Modules\Mcp\Abilities\Build_Composition;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Widget_Type_Resolver {

	private Xml_Parser $xml_parser;

	public function __construct( Xml_Parser $xml_parser ) {
		$this->xml_parser = $xml_parser;
	}

	/**
	 * @return array<string, array>|\WP_Error
	 */
	public function collect_used( \DOMDocument $dom ) {
		$configs = [];

		foreach ( $this->xml_parser->iterate_all_descendants( $dom ) as $node ) {
			$tag = $this->xml_parser->get_tag_name( $node );

			if ( isset( $configs[ $tag ] ) ) {
				continue;
			}

			$config = $this->resolve_type_config( $tag );
			if ( is_wp_error( $config ) ) {
				return $config;
			}
			$configs[ $tag ] = $config;
		}

		return $configs;
	}

	/**
	 * @return \WP_Error|null
	 */
	public function validate_child_types( \DOMDocument $dom, array $widget_configs ) {
		$root = $this->xml_parser->get_root( $dom );
		if ( ! $root ) {
			return null;
		}

		$errors = [];
		$this->collect_child_type_errors( $root, $widget_configs, $errors );

		if ( empty( $errors ) ) {
			return null;
		}

		return new \WP_Error(
			'elementor_invalid_child_type',
			implode( ' ', $errors ),
			[ 'status' => \WP_Http::BAD_REQUEST ]
		);
	}

	public function get_props_schema( ?string $tag, array $widget_configs ): ?array {
		if ( ! $tag ) {
			return null;
		}

		$class = $widget_configs[ $tag ]['class'] ?? null;
		if ( ! $class || ! method_exists( $class, 'get_props_schema' ) ) {
			return null;
		}

		return $class::get_props_schema();
	}

	/**
	 * @return array|\WP_Error  ['elType', 'widgetType', 'allowed_child_types', 'class']
	 */
	private function resolve_type_config( string $type ) {
		$widget = Plugin::$instance->widgets_manager->get_widget_types( $type );
		if ( $widget ) {
			$config = $widget->get_config();
			return [
				'elType' => 'widget',
				'widgetType' => $type,
				'allowed_child_types' => $config['allowed_child_types'] ?? [],
				'class' => get_class( $widget ),
			];
		}

		$element = Plugin::$instance->elements_manager->get_element_types( $type );
		if ( $element ) {
			$config = $element->get_config();
			return [
				'elType' => $type,
				'widgetType' => null,
				'allowed_child_types' => $config['allowed_child_types'] ?? [],
				'class' => get_class( $element ),
			];
		}

		return new \WP_Error(
			'elementor_unknown_type',
			/* translators: %s: element type */
			sprintf( __( 'Unknown element type: %s.', 'elementor' ), $type ),
			[ 'status' => \WP_Http::BAD_REQUEST ]
		);
	}

	private function collect_child_type_errors( \DOMElement $node, array $widget_configs, array &$errors ): void {
		$parent_tag = $this->xml_parser->get_tag_name( $node );
		$allowed = $widget_configs[ $parent_tag ]['allowed_child_types'] ?? [];

		foreach ( $this->xml_parser->get_child_elements( $node ) as $child ) {
			$child_tag = $this->xml_parser->get_tag_name( $child );

			if ( ! empty( $allowed ) && ! in_array( $child_tag, $allowed, true ) ) {
				$errors[] = sprintf(
					/* translators: 1: child tag 2: parent tag 3: allowed types */
					__( '"%1$s" is not allowed as a child of "%2$s". Allowed: %3$s.', 'elementor' ),
					$child_tag,
					$parent_tag,
					implode( ', ', $allowed )
				);
			}

			$this->collect_child_type_errors( $child, $widget_configs, $errors );
		}
	}
}
