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

	private ?array $dependencies = null;

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

	public function set_dependencies( ?array $dependencies ): self {
		$this->dependencies = $dependencies;

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

	public function get_dependencies(): ?array {
		return $this->dependencies;
	}
}
