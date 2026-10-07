<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Adapters;

use Elementor\Modules\AtomicWidgets\PropTypes\Background_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Background_Color_Adapter implements V3_Control_Adapter {

	const CONTROL_TYPE = 'color';
	const COLOR_FIELD = 'color';

	private Color_Adapter $color_adapter;

	public function __construct() {
		$this->color_adapter = new Color_Adapter();
	}

	public function supports( string $prop_type, string $control_type, bool $has_sides ): bool {
		return Background_Prop_Type::get_key() === $prop_type && self::CONTROL_TYPE === $control_type && ! $has_sides;
	}

	public function to_control_value( array $prop_value, ?array $sides, array $control ) {
		$background = $prop_value['value'] ?? null;

		if ( ! is_array( $background ) || [ self::COLOR_FIELD ] !== array_keys( $background ) || ! is_array( $background[ self::COLOR_FIELD ] ) ) {
			return null;
		}

		return $this->color_adapter->to_control_value( $background[ self::COLOR_FIELD ], null, $control );
	}

	public function from_control_value( $control_value, ?array $sides ): ?array {
		$color = $this->color_adapter->from_control_value( $control_value, null );

		return null === $color ? null : Background_Prop_Type::generate( [ self::COLOR_FIELD => $color ] );
	}
}
