<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Boolean_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class V3_Link_Prop_Type extends Object_Prop_Type {

	public static function get_key(): string {
		return 'v3-link';
	}

	protected function define_shape(): array {
		return [
			'url' => String_Prop_Type::make(),
			'is_external' => Boolean_Prop_Type::make(),
			'nofollow' => Boolean_Prop_Type::make(),
		];
	}
}
