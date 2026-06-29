<?php

namespace Elementor\Modules\Interactions\Schema;

use Elementor\Modules\Interactions\Props\Interaction_Item_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Interactions_Schema {
	public static function get() {
		return apply_filters( 'elementor/atomic-widgets/interactions/schema', static::get_interactions_schema() );
	}

	public static function get_interactions_schema(): array {
		return [
			'version' => 1,
			'items' => [ Interaction_Item_Prop_Type::make()->description( 'Interaction item' ) ],
		];
	}
}
