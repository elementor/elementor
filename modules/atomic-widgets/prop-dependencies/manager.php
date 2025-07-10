<?php

namespace Elementor\Modules\AtomicWidgets\PropDependencies;

use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Manager {

	const RELATION_OR = 'or';
	const RELATION_AND = 'and';

	const OPERATORS = [
		'lt',
		'lte',
		'eq',
		'ne',
		'gte',
		'gt',
		'exists',
		'not_exist',
		'in',
		'nin',
		'contains',
		'ncontains',
	];

	/**
	 * @var array{
	 *         relation: self::RELATION_OR|self::RELATION_AND,
	 *         terms: array{
	 *             operator: string,
	 *             path: array<string>,
	 *             value?: mixed,
	 *         }|array{
	 *             relation: self::RELATION_OR|self::RELATION_AND,
	 *             terms: array<mixed>,
	 *         }
	 *     }
	 */
	private array $dependencies;

	public function __construct( string $relation = self::RELATION_OR ) {
		$this->dependencies = [
			'relation' => $relation,
			'terms' => [],
		];
	}

	public static function make( string $relation = self::RELATION_OR ): self {
		return new self( $relation );
	}



	public function where( array $config ): self {
		if ( ! isset( $config['operator'] ) || ! isset( $config['path'] ) ) {
			Utils::safe_throw( 'Term missing mandatory configurations' );
		}

		if ( ! in_array( $config['operator'], self::OPERATORS, true ) ) {
			Utils::safe_throw( "Invalid operator: {$config['operator']}." );
		}

		$term = [
			'operator' => $config['operator'],
			'path' => $config['path'],
			'value' => $config['value'] ?? null,
		];

		$this->dependencies['terms'][] = $term;

		return $this;
	}

	public function get(): array {
		return ! empty( $this->dependencies['terms'] ) ? $this->dependencies : [];
	}


}
