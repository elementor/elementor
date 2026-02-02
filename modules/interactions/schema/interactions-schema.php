<?php

namespace Elementor\Modules\Interactions\Schema;

use Elementor\Modules\Interactions\Props\Interactions_Array_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;

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
			'items' => Interactions_Array_Prop_Type::make()->description( 'The list of interaction items' ),
		];
	}
}
