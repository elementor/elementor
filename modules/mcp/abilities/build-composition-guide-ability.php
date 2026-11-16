<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\Mcp\Abilities\Utils\Prompt_Loader;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Build_Composition_Guide_Ability extends Abstract_Ability {
	const URI = 'elementor://tools/build-composition-guide';

	protected function get_ability_id(): string {
		return 'elementor/build-composition-guide';
	}

	protected function get_definition(): Ability_Definition {
		$description = __( 'Full guide for the build-composition tool: XML structure, configuration ids, layouts, styles, classes, components, and interactions.', 'elementor' );

		return new Ability_Definition(
			__( 'Build Composition Guide', 'elementor' ),
			$description,
			'elementor',
			[ 'type' => 'string' ],
			[
				'mcp' => [
					'type' => 'resource',
					'uri' => self::URI,
					'public' => true,
					'mimeType' => 'text/markdown',
					'description' => $description,
				],
			],
			fn() => current_user_can( 'edit_posts' )
		);
	}

	public function is_exposed_on_server(): bool {
		return false;
	}

	public function execute( $input = [] ) {
		return Prompt_Loader::load( 'build-composition' );
	}
}
