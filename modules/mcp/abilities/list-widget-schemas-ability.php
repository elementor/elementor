<?php

namespace Elementor\Modules\Mcp\Abilities;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class List_Widget_Schemas_Ability extends Abstract_Ability {

	protected function get_ability_id(): string {
		return 'elementor/list-widget-schemas';
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'List Elementor Widget Schemas', 'elementor' ),
			Prompt_Loader::load( 'list-widget-schemas' ),
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
			}
		);
	}

	public function execute( $input = [] ) {
		$widgets = Widget_Context_Helper::get_llm_eligible_widgets();
		$parents_index = Widget_Context_Helper::build_parents_index( $widgets );

		$schemas = [];

		foreach ( $widgets as $widget_type => $config ) {
			if ( Widget_Context_Helper::VERSION_V4 !== Widget_Context_Helper::get_widget_version( $config ) ) {
				continue;
			}

			$schemas[ $widget_type ] = Widget_Context_Helper::build_widget_schema( $widget_type, $config, $parents_index );
		}

		return $schemas;
	}
}
