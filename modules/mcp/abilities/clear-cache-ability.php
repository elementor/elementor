<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\Mcp\Abilities\Utils\Prompt_Loader;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Clear_Cache_Ability extends Abstract_Ability {

	protected function get_ability_id(): string {
		return 'elementor/clear-cache';
	}

	public function is_exposed_via_proxy(): bool {
		return false;
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'Clear Elementor Cache', 'elementor' ),
			Prompt_Loader::load( 'clear-cache' ),
			'elementor',
			[
				'type' => 'object',
				'properties' => [
					'success' => [ 'type' => 'boolean' ],
					'llm_instructions' => [
						'type' => 'string',
						'description' => 'Mandatory next step: follow this text and include it in your reply to the user.',
					],
				],
			],
			[
				'annotations' => [
					'readonly' => false,
					'idempotent' => true,
					'destructive' => true,
				],
				'mutates_page' => false,
			],
			fn() => current_user_can( 'manage_options' )
		);
	}

	public function execute( $input = [] ) {
		Plugin::$instance->files_manager->clear_cache();

		return [
			'success' => true,
			'llm_instructions' => __( 'The Elementor cache was cleared. The files are rebuilt the next time a page is visited, so the first load of each page can be slower. Tell the user that caches outside Elementor (caching plugin, server cache, CDN, browser) were not cleared, and to clear them now, since cached pages can still point to the deleted CSS files. Do not call this tool again for the same problem.', 'elementor' ),
		];
	}
}
