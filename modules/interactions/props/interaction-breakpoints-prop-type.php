<?php

namespace Elementor\Modules\Interactions\Props;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Interaction_Breakpoints_Prop_Type extends Object_Prop_Type {
	public static function get_key(): string {
		return 'interaction-breakpoints';
	}

	protected function define_shape(): array {
		return [
			'excluded' => Excluded_Breakpoints_Prop_Type::make()->description( 'The excluded breakpoints' ),
		];
	}
}
