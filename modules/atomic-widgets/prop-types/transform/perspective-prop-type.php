<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes\Transform;

use Elementor\Modules\AtomicWidgets\PropTypes\Concerns\Has_Default;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Perspective_Prop_Type extends Size_Prop_Type {
	use Has_Default;

	public static function get_key(): string {
		return 'perspective';
	}
}
