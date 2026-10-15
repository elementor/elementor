<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings;

use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Boolean_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Switcher_Setting_Adapter implements V3_Setting_Adapter {

	const CONTROL_TYPE = 'switcher';

	const DEFAULT_RETURN_VALUE = 'yes';

	const OFF_VALUE = '';

	public function supports( array $control ): bool {
		return self::CONTROL_TYPE === ( $control['type'] ?? null );
	}

	public function prop_type( array $control ): Prop_Type {
		return Boolean_Prop_Type::make();
	}

	public function to_control_value( array $prop_value, array $control ) {
		return true === ( $prop_value['value'] ?? null ) ? self::return_value( $control ) : self::OFF_VALUE;
	}

	public function from_control_value( $stored, array $control ) {
		return self::return_value( $control ) === $stored;
	}

	/**
	 * @param array<string, mixed> $control
	 */
	private static function return_value( array $control ): string {
		return (string) ( $control['return_value'] ?? self::DEFAULT_RETURN_VALUE );
	}
}
