<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\Mcp\Abilities\Utils\Prompt_Loader;
use Elementor\Modules\Mcp\Abilities\Utils\Widget_Context_Helper;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class List_Widgets_Ability extends Abstract_Ability {

	protected function get_ability_id(): string {
		return 'elementor/list-widgets';
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'List Elementor Widgets', 'elementor' ),
			Prompt_Loader::load( 'list-widgets' ),
			'elementor',
			[
				'type' => 'array',
				'items' => [
					'type' => 'object',
					'properties' => [
						'type' => [ 'type' => 'string' ],
						'version' => [
							'type' => 'string',
							'enum' => [ 'v3', 'v4' ],
						],
						'description' => [ 'type' => 'string' ],
					],
				],
			],
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
					'version' => [
						'type' => 'string',
						'enum' => [ 'v3', 'v4' ],
						'description' => 'Filter to only widgets of this version. Omit for all eligible widgets.',
					],
				],
			]
		);
	}

	public function execute( $input = [] ) {
		$input = is_array( $input ) ? $input : [];
		$version_filter = $input['version'] ?? null;

		$widgets = Widget_Context_Helper::get_llm_eligible_widgets();

		$summaries = [];

		foreach ( $widgets as $widget_type => $config ) {
			$summary = Widget_Context_Helper::build_widget_summary( $widget_type, $config );

			if ( $version_filter && $summary['version'] !== $version_filter ) {
				continue;
			}

			$summaries[] = $summary;
		}

		usort( $summaries, fn( $a, $b ) => strcmp( $a['type'], $b['type'] ) );

		return $summaries;
	}
}
