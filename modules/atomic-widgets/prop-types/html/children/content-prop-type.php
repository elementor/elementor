<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes\Html\Children;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Array_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Base\Unknown_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Content_Prop_Type extends Array_Prop_Type {
	public static function get_key(): string {
		return 'html-content';
	}

	protected function define_item_type(): Prop_Type {
		return Child_Prop_Type::make();
	}
}
