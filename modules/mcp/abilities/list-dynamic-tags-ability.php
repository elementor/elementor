<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\AtomicWidgets\DynamicTags\Dynamic_Tags_Module;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Transformable_Prop_Type;
use Elementor\Modules\Mcp\Abilities\Dynamic_Tag_Llm_Resolver;
use Elementor\Modules\Mcp\Abilities\Utils\Prompt_Loader;
use Elementor\Modules\Mcp\Abilities\Utils\Widget_Context_Helper;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class List_Dynamic_Tags_Ability extends Abstract_Ability {

	protected function get_ability_id(): string {
		return 'elementor/list-dynamic-tags';
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'List Elementor Dynamic Tags', 'elementor' ),
			Prompt_Loader::load( 'list-dynamic-tags' ),
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

		$entries = [];
		foreach ( $tags as $tag ) {
			$entries[] = $this->build_tag_entry( $tag );
		}

		return $entries;
	}

	private function build_tag_entry( array $tag ): array {
		return [
			'name' => $tag['name'],
			'label' => $tag['label'],
			'categories' => $tag['categories'],
			'settings' => $this->build_settings_schema( $tag['props_schema'] ?? [] ),
		];
	}

	private function build_settings_schema( array $props_schema ): object {
		$settings = [];

		foreach ( $props_schema as $key => $prop_type ) {
			if ( in_array( $key, Dynamic_Tag_Llm_Resolver::OMITTED_SETTING_KEYS, true ) || ! $prop_type instanceof Transformable_Prop_Type ) {
				continue;
			}

			$settings[ $key ] = Widget_Context_Helper::to_plain_llm_schema( $prop_type );
		}

		return (object) $settings;
	}
}
