<?php

namespace Elementor\Modules\AtomicWidgets\Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Control_Conditions {
	// Keys
	const COMPARATOR = 'comparator';
	const OPERATOR = 'operator';
	const CONTROL_ID = 'bind';
	const VALUE_TO_COMPARE = 'valueToCompare';
	const PATH_TO_VALUE = 'pathToValue';
	const ITEMS = 'terms';

	// Operators.
	const AND = 'AND';
	const OR = 'OR';

	// Comparators
	const EQUAL = '==';
	const NOT_EQUAL = '!=';
	const GREATER_THAN = '>';
	const LESS_THAN = '<';
	const GREATER_THAN_OR_EQUAL = '>=';
	const LESS_THAN_OR_EQUAL = '<=';
	const IN = 'IN';
	const NOT_IN = 'NOT_IN';
	const CONTAINS = 'CONTAINS';
	const NOT_CONTAINS = 'NOT_CONTAINS';
	const SET = 'SET';
	const UNSET = 'UNSET';

	private ?array $conditions = null;

	public function get_conditions(): ?array {
		return $this->conditions;
	}

	/**
	 * @param self::AND | self::OR $operator
	 */
	public function init_conditions( $operator = self::OR ): self {
		$this->conditions = [
			self::OPERATOR => $operator,
			self::ITEMS => [],
		];

		return $this;
	}

	/**
	 * @param string $control_id
	 * @param (self::EQUAL | self::NOT_EQUAL | self::GREATER_THAN | self::LESS_THAN | self::GREATER_THAN_OR_EQUAL | self::LESS_THAN_OR_EQUAL | self::IN | self::NOT_IN | self::CONTAINS | self::NOT_CONTAINS | self::SET | self::UNSET) $comparator
	 * @param $value_to_test
	 * @param string $path_to_value
	 */
	public function create_condition( $control_id, $comparator, $value_to_test, $path_to_value ): array {
		return [
			self::CONTROL_ID => $control_id,
			self::COMPARATOR => $comparator,
			self::VALUE_TO_COMPARE => $value_to_test,
			self::PATH_TO_VALUE => $path_to_value,
		];
	}

	/**
	 * @param string $control_id
	 * @param (self::EQUAL | self::NOT_EQUAL | self::GREATER_THAN | self::LESS_THAN | self::GREATER_THAN_OR_EQUAL | self::LESS_THAN_OR_EQUAL | self::IN | self::NOT_IN | self::CONTAINS | self::NOT_CONTAINS | self::SET | self::UNSET) $comparator
	 * @param $value_to_test
	 * @param string $path_to_value
	 */
	public function add_condition( $control_id, $comparator, $value_to_test = null, $path_to_value = '' ): self {
		if ( ! $this->conditions ) {
			$this->init_conditions();
		}

		$this->conditions[ self::ITEMS ][] = $this->create_condition( $control_id, $comparator, $value_to_test, $path_to_value );

		return $this;
	}
}
