<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Email_Advanced_Prop_Type extends Object_Prop_Type {
	public static function get_key(): string {
		return 'email-advanced';
	}

	protected function define_shape(): array {
		return [
			'from-name' => String_Prop_Type::make(),
			'reply-to' => String_Prop_Type::make(),
			'cc' => String_Prop_Type::make(),
			'bcc' => String_Prop_Type::make(),
		];
	}
}
