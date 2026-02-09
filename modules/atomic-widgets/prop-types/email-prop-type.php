<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Array_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Email_Prop_Type extends Object_Prop_Type {
	public static function get_key(): string {
		return 'email';
	}

	protected function define_shape(): array {
		return [
			'to' => String_Prop_Type::make(),
			'subject' => String_Prop_Type::make(),
			'message' => String_Prop_Type::make(),
			'from' => String_Prop_Type::make(),
			'meta-data' => String_Array_Prop_Type::make(),
			'send-as' => String_Prop_Type::make()
				->enum( [ 'html', 'plain' ] )
				->default( 'html' ),
			'from-name' => String_Prop_Type::make(),
			'reply-to' => String_Prop_Type::make(),
			'cc' => String_Prop_Type::make(),
			'bcc' => String_Prop_Type::make(),
		];
	}
}
