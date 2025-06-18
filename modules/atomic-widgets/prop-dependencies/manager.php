<?php

namespace Elementor\Modules\AtomicWidgets\PropDependencies;

use Elementor\Core\Utils\Collection;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Manager {

	const RELATION_OR = 'or';
	const RELATION_AND = 'and';

	const EFFECT_DISABLE = 'disable';
	const EFFECT_HIDE = 'hide';

	/**
	 * @var array{
	 *     array{
	 *         relation: self::RELATION_OR|self::RELATION_AND,
	 *         effect: self::EFFECT_DISABLE|self::EFFECT_HIDE,
	 *         terms: array{
	 *             operator: string,
	 *             path: array<string>,
	 *             value?: mixed,
	 *         }
	 *     }
	 * }
	 */
	private array $dependencies = [];


	public static function make(): self {
		return new self();
	}

	/**
	 * @param $config array{
	 *  operator: string,
	 *  path: array<string>,
	 *  value?: mixed,
	 * }
	 * @return self
	 */
	public function where( array $config, int $index = -1 ): self {
		$term = [
			'operator' => $config['operator'],
			'path' => $config['path'],
			'value' => $config['value'] ?? null,
		];

		if ( -1 === $index || ! isset( $this->dependencies[ $index ] ) ) {
			$this->new_dependency();
			$index = array_key_last( $this->dependencies );
		}

		$this->dependencies[ $index ]['terms'][] = $term;

		return $this;
	}

	/**
	 * @param $config array{
	 *     relation?: self::RELATION_OR | self::RELATION_AND,
	 *     effect?: self::EFFECT_DISABLE | self::EFFECT_HIDE,
	 * }
	 * @return self
	 */
	public function new_dependency( array $config = [] ) {
		$this->dependencies[] = [
			'relation' => $config['relation'] ?? self::RELATION_OR,
			'effect' => $config['effect'] ?? self::EFFECT_DISABLE,
			'terms' => [],
		];

		return $this;
	}

	public function get(): array {
		return Collection::make( $this->dependencies )
			->filter( fn ( $dependency ) => ! empty( $dependency['terms'] ) )
			->all();
	}
}
