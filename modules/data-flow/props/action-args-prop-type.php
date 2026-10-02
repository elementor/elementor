<?php

namespace Elementor\Modules\DataFlow\Props;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Action_Args_Prop_Type extends Object_Prop_Type {
	public static function get_key(): string {
		return 'action-args';
	}

	protected function define_shape(): array {
		return [];
	}

	public function should_persist( $value ): bool {
		return true;
	}
}
