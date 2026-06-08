<?php

namespace Elementor\Modules\AtomicWidgets\CssConverter;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Conversion_Context {
	private array $props = [];

	private array $rules;

	private array $global_variables;

	/**
	 * @param array<int, array{property: string, value: string}> $rules            The full set of sibling declarations.
	 * @param array                                              $global_variables Wired for forward compatibility, empty in v1.
	 */
	public function __construct( array $rules = [], array $global_variables = [] ) {
		$this->rules = $rules;
		$this->global_variables = $global_variables;
	}

	/**
	 * @return array<int, array{property: string, value: string}>
	 */
	public function get_rules(): array {
		return $this->rules;
	}

	public function get_global_variables(): array {
		return $this->global_variables;
	}

	public function get_props(): array {
		return $this->props;
	}

	public function has_prop( string $property ): bool {
		return array_key_exists( $property, $this->props );
	}

	/**
	 * @return mixed
	 */
	public function get_prop( string $property ) {
		return $this->props[ $property ] ?? null;
	}

	/**
	 * @param string $property The output property name the converter owns.
	 * @param mixed  $value    The canonical PropValue contributed for the property.
	 */
	public function set_prop( string $property, $value ): void {
		$this->props[ $property ] = $value;
	}
}
