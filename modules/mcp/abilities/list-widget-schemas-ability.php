<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\Mcp\Abilities\Utils\Prompt_Loader;
use Elementor\Modules\Mcp\Abilities\Utils\Widget_Context_Helper;

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
			},
			[
				'type' => 'object',
				'properties' => [
					'summary' => [
						'type' => 'boolean',
						'default' => false,
						'description' => 'When true, returns an array of { type, description } for discovery instead of full schemas.',
					],
				],
			]
		);
	}

	public function execute( $input = [] ) {
		$input = is_array( $input ) ? $input : [];
		$summary = ! empty( $input['summary'] );

		$widgets = array_filter(
			Widget_Context_Helper::get_llm_eligible_widgets(),
			fn( $config ) => Widget_Context_Helper::VERSION_V4 === Widget_Context_Helper::get_widget_version( $config )
		);

		if ( $summary ) {
			return $this->build_summaries( $widgets );
		}

		return $this->build_schemas( $widgets );
	}

	private function build_summaries( array $widgets ): array {
		$summaries = [];

		foreach ( $widgets as $widget_type => $config ) {
			$full_summary = Widget_Context_Helper::build_widget_summary( $widget_type, $config );
			$summaries[] = [
				'type' => $full_summary['type'],
				'description' => $full_summary['description'] ?? null,
			];
		}

		return [ 'widgets' => $summaries ];
	}

	private function build_schemas( array $widgets ): array {
		$parents_index = Widget_Context_Helper::build_parents_index( $widgets );

		$schemas = [];

		foreach ( $widgets as $widget_type => $config ) {
			$schemas[ $widget_type ] = Widget_Context_Helper::build_widget_schema( $widget_type, $config, $parents_index );
		}

		return $schemas;
	}
}
