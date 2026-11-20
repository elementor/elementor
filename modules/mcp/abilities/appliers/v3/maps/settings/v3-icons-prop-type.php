<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class V3_Icons_Prop_Type extends Object_Prop_Type {

	/**
	 * The icon value becomes a CSS class list and an icon-library lookup; only class-name characters make sense.
	 */
	const CLASS_NAME_PATTERN = '^[A-Za-z0-9 _-]*$';

	public static function get_key(): string {
		return 'v3-icons';
	}

	protected function define_shape(): array {
		return [
			'value' => V3_String_Prop_Type::make()->pattern( self::CLASS_NAME_PATTERN ),
			'library' => V3_String_Prop_Type::make()->pattern( self::CLASS_NAME_PATTERN ),
		];
	}
}
