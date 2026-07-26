<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\Mcp\Abilities\Utils\Interactions_Llm_Schema_Builder;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Interactions_Schema_Resource_Ability extends Abstract_Ability {
	const URI = 'elementor://interactions/schema';

	protected function get_ability_id(): string {
		return 'elementor/interactions-schema-resource';
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'Interactions Schema', 'elementor' ),
			__( 'Native interaction input schema derived from Interaction_Item PropType: shape, allowed enums, and Pro-gated fields for build-composition.', 'elementor' ),
			'elementor',
			[ 'type' => 'string' ],
			[
				'mcp' => [
					'type'        => 'resource',
					'uri'         => self::URI,
					'public'      => true,
					'mimeType'    => 'application/json',
					'description' => __( 'Native interaction item shape, enums, and Pro-gated fields for build-composition.', 'elementor' ),
				],
			],
			fn() => current_user_can( 'edit_posts' )
		);
	}

	public function execute( $input = [] ) {
		return wp_json_encode( Interactions_Llm_Schema_Builder::build() );
	}
}
