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

	const VALUE_DESCRIPTION = 'Icon selection value, copied verbatim from the `elementor/find-icons` tool, for example "fa-solid fa-cart-shopping". Never assemble or guess this string - an unknown icon renders nothing.';

	const LIBRARY_DESCRIPTION = 'Icon library key for the same icon, copied verbatim from the `elementor/find-icons` tool, for example "fa-solid". Must match the library the value was found in. Call `elementor/find-icons` for the libraries installed on this site.';

	protected function define_shape(): array {
		return [
			'value' => String_Prop_Type::make()->description( self::VALUE_DESCRIPTION ),
			'library' => String_Prop_Type::make()->description( self::LIBRARY_DESCRIPTION ),
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
