<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;

class Background_Image_Overlay_Prop_Type extends Object_Prop_Type {
	public static function get_key(): string {
		return 'background-image-overlay';
	}

	protected function define_shape(): array {
		return [
			'image-src' => Image_Src_Prop_Type::make(),
			'size' => String_Prop_Type::make(),
			'position' => String_Prop_Type::make(),
			'resolution' => String_Prop_Type::make()->enum( self::get_resolution_enum_values() ),
		];
	}

	private static function get_resolution_enum_values(): array {
		return [
			'thumbnail',
			'medium',
			'medium_large',
			'large',
			'full',
		];
	}
}
