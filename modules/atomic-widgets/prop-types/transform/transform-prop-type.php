<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes\Transform;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Size_Constants;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Transform_Prop_Type extends Object_Prop_Type {
	public static function get_key(): string {
		return 'transform';
	}

	public function define_shape(): array {
		return [
			'transform-functions' => Transform_Functions_Prop_Type::make(),
			'transform-origin' => Transform_Origin_Prop_Type::make(),
			'perspective' => Size_Prop_Type::make()->units( Size_Constants::LENGTH_UNITS ),
			'perspective-origin' => Perspective_Origin_Prop_Type::make(),
		];
	}
}
