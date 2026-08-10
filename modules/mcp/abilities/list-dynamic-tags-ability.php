<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\AtomicWidgets\DynamicTags\Dynamic_Tags_Module;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Transformable_Prop_Type;
use Elementor\Modules\Mcp\Abilities\Dynamic_Tag_Llm_Resolver;
use Elementor\Modules\Mcp\Abilities\Utils\Widget_Context_Helper;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class List_Dynamic_Tags_Ability extends Abstract_Ability {
	const URI = 'elementor://dynamic-tags';
	const DESCRIPTION = 'List of available dynamic tags for binding properties to dynamic sources.';

	protected function get_ability_id(): string {
		return 'elementor/list-dynamic-tags';
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'List Elementor Dynamic Tags', 'elementor' ),
			__( 'List of available dynamic tags for binding properties to dynamic sources.', 'elementor' ),
			'elementor',
			[ 'type' => 'string' ],
			[
				'mcp' => [
					'type'        => 'resource',
					'uri'         => self::URI,
					'public'      => true,
					'mimeType'    => 'application/json',
					'description' => self::DESCRIPTION,
				],
			],
			fn() => current_user_can( 'edit_posts' )
		);
	}

	public function execute( $input = [], $tags_module = null ) {
		$tags_module = $tags_module ?? Dynamic_Tags_Module::instance();
		$tags = $tags_module->registry->get_tags();

		$entries = [];
		foreach ( $tags as $tag ) {
			$entries[] = $this->build_tag_entry( $tag );
		}

		return wp_json_encode( $entries );
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
