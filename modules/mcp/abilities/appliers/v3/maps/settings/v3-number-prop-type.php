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
	 * @var int|float|null
	 */
	private $minimum = null;

	/**
	 * @var int|float|null
	 */
	private $maximum = null;

	private bool $whole = false;

	public static function get_key(): string {
		return 'v3-number';
	}

	public static function make() {
		return ( new static() )->float();
	}

	/**
	 * @param int|float|null $minimum
	 * @param int|float|null $maximum
	 */
	public function range( $minimum, $maximum ): self {
		$this->minimum = $minimum;
		$this->maximum = $maximum;

		return $this;
	}

	public function whole(): self {
		$this->whole = true;

		return $this;
	}

	protected function validate_value( $value ): bool {
		return parent::validate_value( $value )
			&& abs( $value ) <= Number_Setting_Adapter::MAX_MAGNITUDE
			&& ( null === $this->minimum || $value >= $this->minimum )
			&& ( null === $this->maximum || $value <= $this->maximum )
			&& ( ! $this->whole || floor( (float) $value ) === (float) $value );
	}

	public function to_json_schema(): array {
		$schema = parent::to_json_schema();

		if ( $this->whole ) {
			$schema['properties']['value']['type'] = 'integer';
		}

		if ( null !== $this->minimum ) {
			$schema['properties']['value']['minimum'] = $this->minimum;
		}

		if ( null !== $this->maximum ) {
			$schema['properties']['value']['maximum'] = $this->maximum;
		}

		return $schema;
	}
}
