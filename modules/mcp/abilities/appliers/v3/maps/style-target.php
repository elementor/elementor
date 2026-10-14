<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Style_Target {

	const DEFAULT_STATE = 'default';

	private string $label;

	/**
	 * @var array<int, array{prop: string, state: string, control: V3_Control}>
	 */
	private array $bindings = [];

	private function __construct( string $label ) {
		$this->label = $label;
	}

	public static function make( string $label ): self {
		return new self( $label );
	}

	public function bind( string $prop, V3_Control $control, string $state = self::DEFAULT_STATE ): self {
		$this->bindings[] = [
			'prop' => $prop,
			'state' => $state,
			'control' => $control,
		];

		return $this;
	}

	public function get_label(): string {
		return $this->label;
	}

	/**
	 * @return array<int, array{prop: string, state: string, control: V3_Control}>
	 */
	public function get_bindings(): array {
		return $this->bindings;
	}
}
