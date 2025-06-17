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
	 *  effect?: self::EFFECT_DISABLE | self::EFFECT_HIDE,
	 *  relation?: self::RELATION_OR | self::RELATION_AND,
	 *  operator: string,
	 *  path: array<string>,
	 *  value?: mixed,
	 * }
	 * @return self
	 */
	public function where( array $config ): self {
		$effect = $config['effect'] ?? self::EFFECT_DISABLE;
		$this->dependencies[] = [
			'effect' => $effect,
			'relation' => $config['relation'] ?? self::RELATION_OR,
			'terms' => [
				'operator' => $config['operator'],
				'path' => $config['path'],
				'value' => $config['value'] ?? null,
			],
		];

		return $this;
	}

	public function get(): array {
		return Collection::make( $this->dependencies )
			->filter( fn ( $dependency ) => ! empty( $dependency['terms'] ) )
			->all();
	}
}
