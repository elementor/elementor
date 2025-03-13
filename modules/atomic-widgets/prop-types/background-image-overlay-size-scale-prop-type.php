<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Style_Schema;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Background_Image_Overlay_Size_Scale_Prop_Type extends Object_Prop_Type {
	public static function get_key(): string {
		return 'background-image-size-scale';
	}

	protected function define_shape(): array {
		return [
			'width' => Union_Prop_Type::make()
				->add_prop_type( Size_Prop_Type::make() )
				->add_prop_type( String_Prop_Type::make() ),
			'height' => Union_Prop_Type::make()
				->add_prop_type( Size_Prop_Type::make() )
				->add_prop_type( String_Prop_Type::make() ),
		];
	}
}
