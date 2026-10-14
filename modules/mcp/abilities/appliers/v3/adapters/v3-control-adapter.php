<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Adapters;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

interface V3_Control_Adapter {

	public function supports( string $prop_type, string $control_type, bool $has_sides ): bool;

	/**
	 * @param array<string, mixed> $prop_value V4 PropValue envelope (`$$type` + `value`).
	 * @param string[]|null        $sides
	 * @param array<string, mixed> $control
	 * @return mixed|null Null when the V3 control cannot store the value.
	 */
	public function to_control_value( array $prop_value, ?array $sides, array $control );

	/**
	 * @param mixed         $control_value
	 * @param string[]|null $sides
	 * @return array<string, mixed>|null V4 PropValue envelope, or null when nothing is stored.
	 */
	public function from_control_value( $control_value, ?array $sides ): ?array;
}
