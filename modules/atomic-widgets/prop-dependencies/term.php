<?php

namespace Elementor\Modules\AtomicWidgets\PropDependencies;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Term {

	private string $operator;
	private string $path_to_value;
	private $value_to_compare;
	private $value_on_fail;

	public function __construct( $operator, $path_to_value, $value_to_compare, $value_on_fail ) {
		$this->operator = $operator;
		$this->path_to_value = $path_to_value;
		$this->value_to_compare = $value_to_compare;
		$this->value_on_fail = $value_on_fail;
	}

	/**
	 * @param $config array{
	 * operator: string,
	 * path_to_value?: string,
	 * value_to_compare?: mixed,
	 * value_on_fail?: mixed,
	 * }
	 * @return self
	 */
	public static function make( $config ) {
		return new self(
			$config['operator'],
			$config['path_to_value'],
			$config['value_to_compare'] ?? null,
			$config['value_on_fail'] ?? null
		);
	}

	public function get() {
		return [
			'operator' => $this->operator,
			'path_to_value' => $this->path_to_value,
			'value_to_compare' => $this->value_to_compare,
			'value_on_fail' => $this->value_on_fail,
		];
	}
}
