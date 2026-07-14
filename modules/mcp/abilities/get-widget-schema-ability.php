<?php

namespace Elementor\Modules\Mcp\Abilities;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Get_Widget_Schema_Ability extends Abstract_Ability {

	protected function get_ability_id(): string {
		return 'elementor/get-widget-schema';
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
			],
			function () {
				return current_user_can( 'edit_posts' );
			},
			[
				'type' => 'object',
				'required' => [ 'widget_type' ],
				'properties' => [
					'widget_type' => [
						'type' => 'string',
						'description' => 'Registry identifier of the widget, e.g. "e-heading".',
					],
				],
			]
		);
	}

	public function execute( $input = [] ) {
		$input = is_array( $input ) ? $input : [];
		$widget_type = isset( $input['widget_type'] ) ? sanitize_key( $input['widget_type'] ) : '';

		if ( ! $widget_type ) {
			return new \WP_Error(
				'invalid_input',
				__( 'widget_type is required.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		$config = Widget_Context_Helper::get_widget_config( $widget_type );

		if ( ! $config || ! Widget_Context_Helper::is_widget_eligible_for_llm( $config ) ) {
			return new \WP_Error(
				'elementor_not_found',
				/* translators: %s: widget type */
				sprintf( __( 'Unknown widget type: %s.', 'elementor' ), $widget_type ),
				[ 'status' => \WP_Http::NOT_FOUND ]
			);
		}

		$all_widget_configs = Widget_Context_Helper::get_llm_eligible_widgets();
		$parents_index = Widget_Context_Helper::build_parents_index( $all_widget_configs );

		return Widget_Context_Helper::build_widget_schema( $widget_type, $config, $parents_index );
	}
}
