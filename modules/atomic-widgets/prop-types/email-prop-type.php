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
			'to' => String_Prop_Type::make()
				->default( '' ),
			'subject' => String_Prop_Type::make()
				->default( '' ),
			'message' => String_Prop_Type::make()
				->default( '' ),
			'from' => String_Prop_Type::make()
				->default( '' ),
			'meta-data' => String_Array_Prop_Type::make()
				->default( [] ),
			'send-as' => String_Prop_Type::make()
				->enum( [ 'html', 'plain' ] )
				->default( 'html' ),
			'from-name' => String_Prop_Type::make()
				->default( '' ),
			'reply-to' => String_Prop_Type::make()
				->default( '' ),
			'cc' => String_Prop_Type::make()
				->default( '' ),
			'bcc' => String_Prop_Type::make()
				->default( '' ),
		];
	}
}
