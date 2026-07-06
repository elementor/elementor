<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\AtomicWidgets\PropTypes\Dialect\Dialect_Walker;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Widget_Schema_Ability extends Abstract_Ability {
	const LAYOUT_CONTROL_TYPES = [ 'section', 'tab', 'tabs' ];
	const NON_CONFIGURABLE_PROP_KEYS = [ '_cssid', 'classes', 'attributes', 'display-conditions' ];

	private string $widget_type;

	public function __construct( string $widget_type ) {
		$this->widget_type = $widget_type;
	}

	protected function get_ability_id(): string {
		return 'elementor/widget-schema-' . $this->widget_type;
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'Get Widget Schema', 'elementor' ),
			__( 'Returns the LLM-optimised JSON schema for a widget type.', 'elementor' ),
			'elementor',
			[ 'type' => 'object' ],
			[
				'mcp' => [
					'type'        => 'resource',
					'uri'         => 'elementor://widgets/schema/' . $this->widget_type,
					'mimeType'    => 'application/json',
					'description' => sprintf(
						/* translators: %s: widget type */
						__( 'Schema for the %s widget', 'elementor' ),
						$this->widget_type
					),
				],
			],
			fn() => current_user_can( 'edit_posts' )
		);
	}

	public function execute( $input = [] ) {
		$widget = Plugin::$instance->widgets_manager->get_widget_types( $this->widget_type )
			?? Plugin::$instance->elements_manager->get_element_types( $this->widget_type );

		if ( ! $widget ) {
			return new \WP_Error(
				'widget_not_found',
				sprintf(
					/* translators: %s: widget type */
					__( 'Widget type not found: %s', 'elementor' ),
					$this->widget_type
				),
				[ 'status' => \WP_Http::NOT_FOUND ]
			);
		}

		$config = $widget->get_config();

		if ( ! empty( $config['atomic'] ) ) {
			return $this->build_v4_schema( $config );
		}

		return $this->build_v3_schema( $config );
	}

	private function build_v4_schema( array $config ): array {
		$props_schema = $config['atomic_props_schema'] ?? null;

		if ( empty( $props_schema ) ) {
			// phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
			throw new \RuntimeException( sprintf( 'Widget %s is flagged as atomic but has no atomic_props_schema.', $this->widget_type ) );
		}

		$properties = [];

		foreach ( $props_schema as $key => $prop_type ) {
			if ( ! $this->is_prop_key_configurable( $key, $prop_type ) ) {
				continue;
			}

			$properties[ $key ] = Dialect_Walker::to_schema( $prop_type, 'llm' );
		}

		return [
			'type'        => 'object',
			'properties'  => $properties,
			'llm_guidance' => array_merge(
				Llm_Guidance_Builder::build( $config ),
				[ 'nullable_properties' => 'All properties are nullable. A null value means: use the widget default or no value.' ]
			),
		];
	}

	private function is_prop_key_configurable( string $key, $prop_type ): bool {
		if ( ! in_array( $key, self::NON_CONFIGURABLE_PROP_KEYS, true ) ) {
			return true;
		}

		return (bool) ( $prop_type->get_meta_item( 'llm_configurable' ) ?? false );
	}

	private function build_v3_schema( array $config ): array {
		$controls = $config['controls'] ?? [];
		$properties = [];

		foreach ( $controls as $key => $control ) {
			if ( in_array( $control['type'] ?? '', self::LAYOUT_CONTROL_TYPES, true ) ) {
				continue;
			}

			$property = [ 'type' => $control['type'] ?? 'string' ];

			if ( isset( $control['default'] ) ) {
				$property['default'] = $control['default'];
			}

			if ( ! empty( $control['options'] ) ) {
				$property['options'] = $control['options'];
			}

			$properties[ $key ] = $property;
		}

		return [
			'type'       => 'object',
			'properties' => $properties,
		];
	}
}
