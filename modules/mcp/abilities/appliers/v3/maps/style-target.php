<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Fragments\Style_Fragment;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Style_Target {

	const DEFAULT_STATE = 'default';

	const GLOBAL_STATES = [ self::DEFAULT_STATE, 'hover' ];

	private string $alias;

	private string $label = '';

	private string $description = '';

	private ?string $selector = null;

	/**
	 * @var string[]
	 */
	private array $declared_states = [];

	/**
	 * @var array<string, string>
	 */
	private array $defaults = [];

	/**
	 * @var array<int, array{prop: string, state: string, control: V3_Control}>
	 */
	private array $bindings = [];

	private ?Kit_Controls_Source $kit_source = null;

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

	/**
	 * Plain-language purpose of the inner element and when it is hidden, conditional or stateful,
	 * for agents that cannot see the rendered widget.
	 */
	public function description( string $description ): self {
		$this->description = $description;

		return $this;
	}

	/**
	 * DOM selector inside the widget wrapper that declarations the widget controls cannot store
	 * fall back to as custom CSS. An empty string is the wrapper itself; targets without a
	 * selector drop those declarations instead.
	 */
	public function selector( string $selector ): self {
		$this->selector = $selector;

		return $this;
	}

	/**
	 * Widget-specific states on top of {@see self::GLOBAL_STATES}, written as `<alias>:<state> { ... }`.
	 */
	public function states( string ...$states ): self {
		$this->declared_states = $states;

		return $this;
	}

	/**
	 * Declarations the widget's own stylesheet paints on this target before any setting is set,
	 * kept in sync with the widget stylesheet by hand.
	 *
	 * @param array<string, string> $declarations CSS property => value.
	 */
	public function defaults( array $declarations ): self {
		$this->defaults = $declarations;

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

	/**
	 * The target reads and writes controls of the active kit instead of the widget's,
	 * so a write styles every page of the site.
	 */
	public function kit_hosted( Kit_Controls_Source $source ): self {
		$this->kit_source = $source;

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

	public function get_description(): string {
		return $this->description;
	}

	public function get_selector(): ?string {
		return $this->selector;
	}

	/**
	 * @return string[]
	 */
	public function get_declared_states(): array {
		return $this->declared_states;
	}

	/**
	 * @return array<string, string>
	 */
	public function get_defaults(): array {
		return $this->defaults;
	}

	/**
	 * @return array<int, array{prop: string, state: string, control: V3_Control}>
	 */
	public function get_bindings(): array {
		return $this->bindings;
	}

	public function get_kit_source(): ?Kit_Controls_Source {
		return $this->kit_source;
	}
}
