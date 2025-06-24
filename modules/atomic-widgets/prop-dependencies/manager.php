<?php

namespace Elementor\Modules\AtomicWidgets\PropDependencies;

use Elementor\Core\Utils\Collection;
use Elementor\Utils;

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
	 *         relation: self::RELATION_OR|self::RELATION_AND,
	 *         effect: self::EFFECT_DISABLE|self::EFFECT_HIDE,
	 *         terms: array{
	 *             operator: string,
	 *             path: array<string>,
	 *             value?: mixed,
	 *         }
	 *     }
	 */
	private array $dependencies;

	public function __construct() {
		$this->dependencies = [];
	}


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
	public function where( array $config ): self {
		$term = [
			'operator' => $config['operator'],
			'path' => $config['path'],
			'value' => $config['value'] ?? null,
		];

		if ( empty( $this->dependencies ) ) {
			$this->new_dependency();
		}

		$last_index = array_key_last( $this->dependencies );
		$this->dependencies[ $last_index ]['terms'][] = $term;

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
		$new_dependency = [
			'relation' => $config['relation'] ?? self::RELATION_OR,
			'effect' => $config['effect'] ?? self::EFFECT_DISABLE,
			'terms' => [],
		];

		$existing_dependency_with_effect = Collection::make( $this->dependencies )
			->find( fn ( $dependency ) => $dependency['effect'] === $new_dependency['effect'] );

		if ( $existing_dependency_with_effect ) {
			Utils::safe_throw( "Dependency with effect of {$new_dependency['effect']} already exists." );
		}

		$this->dependencies[] = $new_dependency;

		return $this;
	}

	public function get(): array {
		return Collection::make( $this->dependencies )
			->filter( fn ( $dependency ) => ! empty( $dependency['terms'] ) )
			->all();
	}
}
