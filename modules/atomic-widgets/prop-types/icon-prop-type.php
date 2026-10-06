<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Icon_Prop_Type extends Object_Prop_Type {
	public static function get_key(): string {
		return 'icon';
	}

	protected function define_shape(): array {
		return [
			'value' => String_Prop_Type::make(),
			'library' => String_Prop_Type::make(),
		];
	}

	protected function validate_value( $value ): bool {
		$icon_value = $value['value']['value'] ?? '';
		$library = $value['library']['value'] ?? '';

		return (
			is_string( $icon_value ) &&
			'' !== $icon_value &&
			is_string( $library ) &&
			'' !== $library &&
			parent::validate_value( $value )
		);
	}
}
