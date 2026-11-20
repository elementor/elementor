<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\Mcp\Abilities\Utils\Pro_Features_Discovery_Registry;
use Elementor\Modules\Mcp\Abilities\Utils\Prompt_Loader;
use Elementor\Modules\Mcp\Abilities\Utils\Widget_Context_Helper;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Get_Widget_Schema_Ability extends Abstract_Ability {

	protected function get_ability_id(): string {
		return 'elementor/get-widget-schemas';
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'Get Elementor Widget Schema', 'elementor' ),
			Prompt_Loader::load( 'get-widget-schema' ),
			'elementor',
			[ 'type' => 'object' ],
			[
				'annotations' => [
					'readonly' => true,
					'idempotent' => true,
					'destructive' => false,
				],
				'mutates_page' => false,
			],
			function () {
				return current_user_can( 'edit_posts' );
			},
			[
				'type' => 'object',
				'required' => [ 'widget_type' ],
				'properties' => [
					'widget_type' => [
						'type' => 'array',
						'description' => 'Registry identifiers of the widgets, e.g. ["e-heading"].',
						'items' => [
							'type' => 'string',
						],
					],
				],
			]
		);
	}

	public function execute( $input = [] ) {
		$input = is_array( $input ) ? $input : [];

		if ( ! array_key_exists( 'widget_type', $input ) ) {
			return $this->invalid_input_error();
		}

		$widget_types = $input['widget_type'];

		if ( is_string( $widget_types ) ) {
			$widget_types = [ $widget_types ];
		}

		if ( ! is_array( $widget_types ) || [] === $widget_types ) {
			return $this->invalid_input_error();
		}

		$types = [];

		foreach ( $widget_types as $widget_type ) {
			if ( ! is_string( $widget_type ) ) {
				return $this->invalid_input_error();
			}

			$sanitized = sanitize_key( $widget_type );

			if ( '' === $sanitized ) {
				return $this->invalid_input_error();
			}

			if ( ! in_array( $sanitized, $types, true ) ) {
				$types[] = $sanitized;
			}
		}

		$parents_index = Widget_Context_Helper::build_parents_index(
			Widget_Context_Helper::get_llm_eligible_widgets()
		);
		$schemas = [];
		$errors = [];

		foreach ( $types as $type ) {
			$schema = $this->resolve_widget_schema( $type, $parents_index );

			if ( is_wp_error( $schema ) ) {
				$errors[ $type ] = [
					'code' => $schema->get_error_code(),
					'message' => $schema->get_error_message(),
				];
				continue;
			}

			$schemas[ $type ] = $schema;
		}

		return [
			'schemas' => $schemas,
			'errors' => $errors,
		];
	}

	private function resolve_widget_schema( string $widget_type, array $parents_index ) {
		if ( Pro_Features_Discovery_Registry::requires_pro( $widget_type ) ) {
			return Pro_Features_Discovery_Registry::for_widget( $widget_type );
		}

		$config = Widget_Context_Helper::get_widget_config( $widget_type );

		if ( ! $config || ! Widget_Context_Helper::is_widget_eligible_for_llm( $config ) ) {
			return $this->unknown_widget_error( $widget_type );
		}

		$is_v3 = Widget_Context_Helper::VERSION_V3 === Widget_Context_Helper::get_widget_version( $config );

		if ( $is_v3 && ! Widget_Context_Helper::is_v3_supported( $widget_type ) ) {
			return new \WP_Error(
				'elementor_v3_not_supported',
				__( 'This is a legacy V3 widget and cannot be modified through this MCP. Edit V3 widgets directly in the Elementor editor.', 'elementor' ),
				[
					'status' => \WP_Http::BAD_REQUEST,
					'widget_type' => $widget_type,
					'version' => 'v3',
				]
			);
		}

		return Widget_Context_Helper::build_widget_schema( $widget_type, $config, $parents_index )
			?? $this->unknown_widget_error( $widget_type );
	}

	private function invalid_input_error(): \WP_Error {
		return new \WP_Error(
			'invalid_input',
			__( 'widget_type is required.', 'elementor' ),
			[ 'status' => \WP_Http::BAD_REQUEST ]
		);
	}

	private function unknown_widget_error( string $widget_type ): \WP_Error {
		return new \WP_Error(
			'elementor_not_found',
			/* translators: %s: widget type */
			sprintf( __( 'Unknown widget type: %s.', 'elementor' ), $widget_type ),
			[ 'status' => \WP_Http::NOT_FOUND ]
		);
	}
}
