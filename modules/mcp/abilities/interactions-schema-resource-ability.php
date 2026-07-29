<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\Interactions\Props\Interaction_Item_Prop_Type;
use Elementor\Modules\Mcp\Abilities\Utils\Widget_Context_Helper;

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
			__( 'Native interaction item schema: shape, allowed enums, and defaults for build-composition.', 'elementor' ),
			'elementor',
			[ 'type' => 'string' ],
			[
				'mcp' => [
					'type'        => 'resource',
					'uri'         => self::URI,
					'public'      => true,
					'mimeType'    => 'application/json',
					'description' => __( 'Native interaction item shape, enums, and defaults for build-composition.', 'elementor' ),
				],
			],
			fn() => current_user_can( 'edit_posts' )
		);
	}

	public function execute( $input = [] ) {
		return wp_json_encode( Widget_Context_Helper::to_plain_llm_schema( Interaction_Item_Prop_Type::make() ) );
	}
}
