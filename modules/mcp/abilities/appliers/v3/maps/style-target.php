<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Fragments\Style_Fragment;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Style_Target {

	const DEFAULT_STATE = 'default';

	private string $alias;

	private string $label = '';

	/**
	 * @var array<int, array{prop: string, state: string, control: V3_Control}>
	 */
	private array $bindings = [];

	private function __construct( string $alias ) {
		$this->alias = $alias;
	}

	public static function make( string $alias ): self {
		return new self( $alias );
	}

	public function label( string $label ): self {
		$this->label = $label;

		return $this;
	}

	public function bind( string $prop, V3_Control $control, string $state = self::DEFAULT_STATE ): self {
		$this->bindings[] = [
			'prop' => $prop,
			'state' => $state,
			'control' => $control,
		];

		return $this;
	}

	public function with( Style_Fragment $fragment ): self {
		$fragment->apply_to( $this );

		return $this;
	}

	public function get_alias(): string {
		return $this->alias;
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
