<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings;

use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Float number for V3 NUMBER controls. Its own key keeps it off the shared V4 number plain
 * resolver, which casts to int and would drop decimals (e.g. a Counter ending at 4.5).
 */
class V3_Number_Prop_Type extends Number_Prop_Type {

	/**
	 * @var int|float
	 */
	private $minimum = -Number_Setting_Adapter::MAX_MAGNITUDE;

	/**
	 * @var int|float
	 */
	private $maximum = Number_Setting_Adapter::MAX_MAGNITUDE;

	public static function get_key(): string {
		return 'v3-number';
	}

	public static function make() {
		return ( new static() )->float();
	}

	/**
	 * @param int|float $minimum
	 * @param int|float $maximum
	 */
	public function range( $minimum, $maximum ): self {
		$this->minimum = $minimum;
		$this->maximum = $maximum;

		return $this;
	}

	protected function validate_value( $value ): bool {
		return parent::validate_value( $value ) && $value >= $this->minimum && $value <= $this->maximum;
	}

	public function to_json_schema(): array {
		$schema = parent::to_json_schema();
		$schema['properties']['value']['minimum'] = $this->minimum;
		$schema['properties']['value']['maximum'] = $this->maximum;

		return $schema;
	}
}
