<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Compiled_V3_Setting {

	private string $control_key;

	private bool $dynamic;

	/**
	 * @var array<string, mixed>
	 */
	private array $schema;

	/**
	 * @param string               $control_key
	 * @param bool                 $dynamic
	 * @param array<string, mixed> $schema
	 */
	public function __construct( string $control_key, bool $dynamic, array $schema ) {
		$this->control_key = $control_key;
		$this->dynamic = $dynamic;
		$this->schema = $schema;
	}

	public function get_control_key(): string {
		return $this->control_key;
	}

	public function is_dynamic(): bool {
		return $this->dynamic;
	}

	/**
	 * @return array<string, mixed>
	 */
	public function get_schema(): array {
		return $this->schema;
	}
}
