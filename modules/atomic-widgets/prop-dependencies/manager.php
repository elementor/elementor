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
	 *     disable: array{
	 *         relation: self::RELATION_OR|self::RELATION_AND,
	 *         terms: array
	 *     },
	 *     hide: array{
	 *         relation: self::RELATION_OR|self::RELATION_AND,
	 *         terms: array
	 *     }
	 * }
	 */
	private $dependencies;

	public function __construct() {
		$this->dependencies = [
			'disable' => [
				'relation' => self::RELATION_OR,
				'terms' => [],
			],
			'hide' => [
				'relation' => self::RELATION_OR,
				'terms' => [],
			],
		];
	}

	public static function make(): self {
		return new self();
	}

	/**
	 * @param $config array{
	 * effect?: self::EFFECT_DISABLE | self::EFFECT_HIDE,
	 * operator: string,
	 * path_to_value: array<string>,
	 * value_to_compare?: mixed,
	 * value_on_fail?: mixed,
	 * }
	 * @return self
	 */
	public function where( array $config ): self {
		$effect = $config['effect'] ?? self::EFFECT_DISABLE;
		$this->dependencies[ $effect ]['terms'][] = [
			'operator' => $config['operator'],
			'path_to_value' => $config['path_to_value'],
			'value_to_compare' => $config['value_to_compare'] ?? null,
			'value_on_fail' => $config['value_on_fail'] ?? null,
		];

		return $this;
	}

	public function get(): array {
		return Collection::make( $this->dependencies )
			->filter( fn ( $effect ) => ! empty( $effect['terms'] ) )
			->map( fn ( $effect ) => [
				'relation' => $effect['relation'],
				'terms' => $effect['terms'],
			] )
			->all();
	}
}
