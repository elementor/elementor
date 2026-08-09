<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\Mcp\Abilities\Utils\Prompt_Loader;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class List_Resources_Ability extends Abstract_Ability {

	protected function get_ability_id(): string {
		return 'elementor/list-resources';
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'List Elementor Resources', 'elementor' ),
			Prompt_Loader::load( 'list-resources' ),
			'elementor',
			[
				'type' => 'object',
				'properties' => [
					'resources' => [
						'type' => 'array',
						'items' => [
							'type' => 'object',
							'properties' => [
								'uri' => [ 'type' => 'string' ],
								'name' => [ 'type' => 'string' ],
								'description' => [ 'type' => 'string' ],
								'mimeType' => [ 'type' => 'string' ],
							],
						],
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
			fn() => current_user_can( 'edit_posts' )
		);
	}

	public function execute( $input = [] ) {
		return [
			'resources' => $this->get_resource_catalog(),
		];
	}

	private function get_resource_catalog(): array {
		return [
			[
				'uri' => Style_Best_Practices_Ability::URI,
				'name' => 'Style Best Practices',
				'description' => 'Design quality guidelines for creating distinctive, intentional aesthetics. Covers typography, color strategy, spacing, motion, and visual hierarchy.',
				'mimeType' => 'text/markdown',
			],
			[
				'uri' => Wordpress_Best_Practices_Ability::URI,
				'name' => 'WordPress Best Practices',
				'description' => 'Opinionated WordPress patterns for Elementor builds: repeating layouts (single template vs N pages), include-all + exclude-exceptions condition scoping, Post Content placement, dynamic tags.',
				'mimeType' => 'text/markdown',
			],
			[
				'uri' => Manage_Variable_Guide_Ability::URI,
				'name' => 'Manage Global Variable Guide',
				'description' => 'Detailed guide for using the manage-global-variable tool. Covers available types, naming rules, value rules, and operation examples.',
				'mimeType' => 'text/plain',
			],
			[
				'uri' => Global_Classes_Resource_Ability::URI,
				'name' => 'Global Classes',
				'description' => 'Reusable CSS classes from the active kit, ordered from highest to lowest CSS priority. Check first before adding inline styles.',
				'mimeType' => 'application/json',
			],
			[
				'uri' => Global_Variables_Resource_Ability::URI,
				'name' => 'Global Variables',
				'description' => 'Design tokens (colors, fonts, sizes) from the active kit; check before styling with variables.',
				'mimeType' => 'application/json',
			],
			[
				'uri' => List_Dynamic_Tags_Ability::URI,
				'name' => 'Dynamic Tags',
				'description' => List_Dynamic_Tags_Ability::DESCRIPTION,
				'mimeType' => 'application/json',
			],
			[
				'uri' => Interactions_Schema_Resource_Ability::URI,
				'name' => 'Interactions Schema',
				'description' => 'Interaction item shape, enums, and defaults for build-composition.',
				'mimeType' => 'application/json',
			],
		];
	}
}
