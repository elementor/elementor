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
				'uri' => Manage_Variable_Guide_Ability::URI,
				'name' => 'Manage Global Variable Guide',
				'description' => 'Detailed guide for using the manage-global-variable tool. Covers available types, naming rules, value rules, and operation examples.',
				'mimeType' => 'text/plain',
			],
		];
	}
}
