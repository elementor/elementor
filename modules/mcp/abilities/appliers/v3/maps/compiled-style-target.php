<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Compiled_Style_Target {

	private string $alias;

	private string $label;

	/**
	 * @var Compiled_Style_Binding[]
	 */
	private array $bindings;

	/**
	 * @param string                   $alias
	 * @param string                   $label
	 * @param Compiled_Style_Binding[] $bindings
	 */
	public function __construct( string $alias, string $label, array $bindings ) {
		$this->alias = $alias;
		$this->label = $label;
		$this->bindings = $bindings;
	}

	public function get_alias(): string {
		return $this->alias;
	}

	public function get_label(): string {
		return $this->label;
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
}
