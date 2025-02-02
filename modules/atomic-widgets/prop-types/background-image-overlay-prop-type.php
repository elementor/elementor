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
			'position' => String_Prop_Type::make()->enum( self::get_position_enum_values() ),
			'resolution' => String_Prop_Type::make()->enum( [ 'thumbnail', 'medium', 'medium_large', 'large', 'full' ] ),
			'repeat' => String_Prop_Type::make()->enum( [ 'repeat', 'repeat-x', 'repeat-y', 'no-repeat' ] ),
			'size' => String_Prop_Type::make()->enum( [ 'auto', 'cover', 'contain' ] ),
			'attachment' => String_Prop_Type::make()->enum( [ 'fixed', 'scroll' ] ),
		];
	}

	private static function get_position_enum_values(): array {
		return [
			'center center',
			'center left',
			'center right',
			'top center',
			'top left',
			'top right',
			'bottom center',
			'bottom left',
			'bottom right',
		];
	}
}
