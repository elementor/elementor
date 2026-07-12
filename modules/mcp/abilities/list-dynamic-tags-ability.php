<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\AtomicWidgets\DynamicTags\Dynamic_Tags_Module;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Transformable_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class List_Dynamic_Tags_Ability extends Abstract_Ability {

	// A generic render-time default added to every tag; it is noise for configuration, so it's
	// omitted here. Mirrors the frontend's `OMITTED_DYNAMIC_SETTING_KEYS`.
	const OMITTED_SETTING_KEYS = [ 'fallback' ];

	protected function get_ability_id(): string {
		return 'elementor/list-dynamic-tags';
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'List Elementor Dynamic Tags', 'elementor' ),
			__( 'Returns the available dynamic tags. To bind a property to a dynamic source, set its value to { "$$type": "dynamic", "value": { "name": <tag name>, "settings": { ... } } } using a tag whose name appears here, and populate "settings" per the tag entry\'s schema.', 'elementor' ),
			'elementor',
			[
				'type' => 'array',
				'items' => [
					'type' => 'object',
					'properties' => [
						'name' => [ 'type' => 'string' ],
						'label' => [ 'type' => 'string' ],
						'categories' => [
							'type' => 'array',
							'items' => [ 'type' => 'string' ],
						],
						'settings' => [ 'type' => 'object' ],
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
			}
		);
	}

	public function execute( $input = [] ) {
		$tags = Dynamic_Tags_Module::instance()->registry->get_tags();

		return array_values( array_map( [ $this, 'build_tag_entry' ], $tags ) );
	}

	private function build_tag_entry( array $tag ): array {
		return [
			'name' => $tag['name'],
			'label' => $tag['label'],
			'categories' => $tag['categories'],
			'settings' => $this->build_settings_schema( $tag['props_schema'] ?? [] ),
		];
	}

	private function build_settings_schema( array $props_schema ): array {
		$settings = [];

		foreach ( $props_schema as $key => $prop_type ) {
			if ( in_array( $key, self::OMITTED_SETTING_KEYS, true ) || ! $prop_type instanceof Transformable_Prop_Type ) {
				continue;
			}

			$settings[ $key ] = $prop_type->to_json_schema();
		}

		return $settings;
	}
}
