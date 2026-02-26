<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes\Html;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Html\Children\Content_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Html_V4_Prop_Type extends Object_Prop_Type {
	public static function get_key(): string {
		return 'html-v4';
	}

	protected function define_shape(): array {
		return [
			'type' => String_Prop_Type::make(),
			'content' => Content_Prop_Type::make(),
		];
	}
}
