<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class V3_Control {

	private string $setting;

	private bool $responsive = false;

	/**
	 * @var string[]|null
	 */
	private ?array $sides = null;

	/**
	 * @var array<string, scalar>|null Sibling control values the binding needs to take effect.
	 */
	private ?array $requirements = null;

	private function __construct( string $setting ) {
		$this->setting = $setting;
	}

	public static function bind_to( string $setting ): self {
		return new self( $setting );
	}

	public function responsive(): self {
		$this->responsive = true;

		return $this;
	}

	public function sides( string ...$sides ): self {
		$this->sides = $sides;

		return $this;
	}

	/**
	 * Overrides the requirements derived from the control's `condition`.
	 *
	 * @param array<string, scalar> $setting_values
	 */
	public function requires( array $setting_values ): self {
		$this->requirements = $setting_values;

		return $this;
	}

	public function get_setting(): string {
		return $this->setting;
	}

	public function is_responsive(): bool {
		return $this->responsive;
	}

	/**
	 * @return string[]|null
	 */
	public function get_sides(): ?array {
		return $this->sides;
	}

	/**
	 * @return array<string, scalar>|null
	 */
	public function get_requirements(): ?array {
		return $this->requirements;
	}
}
