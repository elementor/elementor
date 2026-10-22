<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Array_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class V3_Gallery_Prop_Type extends Array_Prop_Type {

	public static function get_key(): string {
		return 'v3-gallery';
	}

	protected function define_item_type(): Prop_Type {
		return V3_Gallery_Item_Prop_Type::make();
	}
}
