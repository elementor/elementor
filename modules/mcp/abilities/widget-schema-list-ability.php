<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Widget_Schema_List_Ability extends Abstract_Ability {
	protected function get_ability_id(): string {
		return 'elementor/widget-schema-list';
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'List Widget Schemas', 'elementor' ),
			__( 'Returns a list of all available widget schema URIs.', 'elementor' ),
			'elementor',
			[ 'type' => 'object' ],
			[
				'mcp' => [
					'type'        => 'resource',
					'uri'         => 'elementor://widgets/schema',
					'mimeType'    => 'application/json',
					'description' => __( 'List of all available widget schema URIs', 'elementor' ),
				],
			],
			fn() => current_user_can( 'edit_posts' )
		);
	}

	public function execute( $input = [] ) {
		$widgets = Plugin::$instance->widgets_manager->get_widget_types();

		return array_values( array_map(
			fn( $type, $widget ) => [
				'uri'  => 'elementor://widgets/schema/' . $type,
				'name' => $widget->get_title(),
			],
			array_keys( $widgets ),
			$widgets
		) );
	}
}
