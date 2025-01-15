<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;

class Background_Image_Overlay_Prop_Type extends Object_Prop_Type {
	public static function get_key(): string {
		return 'background-image-overlay';
	}

	protected function define_shape(): array {
		return [
			'image-src' => Image_Src_Prop_Type::make(),
		];
	}
}
