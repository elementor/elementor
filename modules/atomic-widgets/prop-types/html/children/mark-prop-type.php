<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes\Html\Children;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Array_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Base\Unknown_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Mark_Prop_Type extends Array_Prop_Type {
	public static function get_key(): string {
		return 'html-mark';
	}

	protected function define_item_type(): Prop_Type {
		return Unknown_Prop_Type::make();
	}
}
