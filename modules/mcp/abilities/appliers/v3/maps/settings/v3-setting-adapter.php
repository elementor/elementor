<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings;

use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Bridges one V3 control to a V4 prop type: the prop type resolves, validates and sanitizes
 * the plain value, and the adapter converts the resulting prop value to and from the
 * control's stored format.
 */
interface V3_Setting_Adapter {

	/**
	 * @param array<string, mixed> $control
	 */
	public function supports( array $control ): bool;

	/**
	 * @param array<string, mixed> $control
	 */
	public function prop_type( array $control ): Prop_Type;

	/**
	 * @param array<string, mixed> $prop_value Sanitized `{ $$type, value }` prop value.
	 * @param array<string, mixed> $control
	 * @return mixed
	 */
	public function to_control_value( array $prop_value, array $control );

	/**
	 * @param mixed                $stored
	 * @param array<string, mixed> $control
	 * @return mixed Plain value, or null when the stored value is unreadable.
	 */
	public function from_control_value( $stored, array $control );
}
