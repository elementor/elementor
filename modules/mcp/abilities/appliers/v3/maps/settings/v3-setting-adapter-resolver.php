<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Picks the setting adapter for a V3 control by its type. Used to derive a repeater row's
 * item prop types from the control's own fields, so maps do not re-declare them.
 *
 * Only content-mappable control types resolve; anything else (hidden, color, style groups,
 * nested repeaters, ...) returns null and is skipped by the caller.
 */
class V3_Setting_Adapter_Resolver {

	public static function resolve( array $control ): ?V3_Setting_Adapter {
		$type = $control['type'] ?? null;

		switch ( $type ) {
			case 'url':
				return new Link_Setting_Adapter();
			case 'icons':
				return new Icons_Setting_Adapter();
			case 'gallery':
				return new Gallery_Setting_Adapter();
			case 'slider':
				return new Size_Setting_Adapter();
			case 'number':
				return new Number_Setting_Adapter();
			case 'switcher':
				return new Switcher_Setting_Adapter();
			case 'text':
			case 'textarea':
				return new String_Setting_Adapter();
			case 'select':
			case 'select2':
			case 'choose':
				$multi = new Multi_Enum_From_Control_Setting_Adapter();

				if ( $multi->supports( $control ) ) {
					return $multi;
				}

				$enum = new Enum_From_Control_Setting_Adapter();

				return $enum->supports( $control ) ? $enum : null;
			default:
				return null;
		}
	}
}
