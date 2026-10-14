<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * One repeater row; its shape is set from the map's field settings.
 */
class V3_Repeater_Item_Prop_Type extends Object_Prop_Type {

	public static function get_key(): string {
		return 'v3-repeater-item';
	}

	protected function define_shape(): array {
		return [];
	}
}
