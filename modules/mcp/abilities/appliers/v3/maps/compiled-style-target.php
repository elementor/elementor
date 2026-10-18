<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Compiled_Style_Target {

	private string $alias;

	private string $label;

	private ?string $selector;

	/**
	 * @var Compiled_Style_Binding[]
	 */
	private array $bindings;

	/**
	 * @var array<string, string>
	 */
	private array $defaults;

	/**
	 * @param string                   $alias
	 * @param string                   $label
	 * @param Compiled_Style_Binding[] $bindings
	 * @param string|null              $selector
	 * @param array<string, string>    $defaults
	 */
	public function __construct( string $alias, string $label, array $bindings, ?string $selector = null, array $defaults = [] ) {
		$this->alias = $alias;
		$this->label = $label;
		$this->bindings = $bindings;
		$this->selector = $selector;
		$this->defaults = $defaults;
	}

	/**
	 * @return array<string, string>
	 */
	public function get_defaults(): array {
		return $this->defaults;
	}

	public function get_alias(): string {
		return $this->alias;
	}

	public function get_label(): string {
		return $this->label;
	}

	public function get_selector(): ?string {
		return $this->selector;
	}

	/**
	 * @return Compiled_Style_Binding[]
	 */
	public function get_bindings(): array {
		return $this->bindings;
	}

	/**
	 * @return string[]
	 */
	public function get_props(): array {
		return array_values( array_unique( array_map(
			fn( Compiled_Style_Binding $binding ) => $binding->get_prop(),
			$this->bindings
		) ) );
	}

	/**
	 * States that have at least one binding, in binding order.
	 *
	 * @return string[]
	 */
	public function get_states(): array {
		return array_values( array_unique( array_map(
			fn( Compiled_Style_Binding $binding ) => $binding->get_state(),
			$this->bindings
		) ) );
	}

	/**
	 * Bound properties for each state, in binding order.
	 *
	 * @return array<string, string[]>
	 */
	public function get_props_by_state(): array {
		$props_by_state = [];

		foreach ( $this->bindings as $binding ) {
			$state = $binding->get_state();
			$prop = $binding->get_prop();

			if ( ! in_array( $prop, $props_by_state[ $state ] ?? [], true ) ) {
				$props_by_state[ $state ][] = $prop;
			}
		}

		return $props_by_state;
	}
}
