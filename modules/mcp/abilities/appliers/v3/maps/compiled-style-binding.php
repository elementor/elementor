<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Compiled_Style_Binding {

	private string $prop;
	private string $state;
	private string $setting;
	private string $control_type;
	private bool $responsive;

	/**
	 * @var string[]|null
	 */
	private ?array $sides;

	/**
	 * @var array<string, mixed>
	 */
	private array $dependency_values;

	private string $read_type;

	/**
	 * @param array{prop: string, state: string, setting: string, control_type: string, responsive: bool, sides: string[]|null, dependency_values: array<string, mixed>, read_type: string} $fields
	 */
	public function __construct( array $fields ) {
		$this->prop = $fields['prop'];
		$this->state = $fields['state'];
		$this->setting = $fields['setting'];
		$this->control_type = $fields['control_type'];
		$this->responsive = $fields['responsive'];
		$this->sides = $fields['sides'];
		$this->dependency_values = $fields['dependency_values'];
		$this->read_type = $fields['read_type'];
	}

	public function get_prop(): string {
		return $this->prop;
	}

	public function get_state(): string {
		return $this->state;
	}

	public function get_setting(): string {
		return $this->setting;
	}

	public function get_control_type(): string {
		return $this->control_type;
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
	 * @return array<string, mixed>
	 */
	public function get_dependency_values(): array {
		return $this->dependency_values;
	}

	public function get_read_type(): string {
		return $this->read_type;
	}
}
