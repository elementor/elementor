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
	 *         terms: (Term|self)[]
	 *     },
	 *     hide: array{
	 *         relation: self::RELATION_OR|self::RELATION_AND,
	 *         terms: (Term|self)[]
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
	 * @param self::EFFECT_DISABLE|self::EFFECT_HIDE $effect
	 * @param Term $term
	 * @return $this
	 */
	public function where( $effect, Term $term ): self {
		$this->dependencies[ $effect ]['terms'][] = $term;

		return $this;
	}

	public function get(): array {
		return Collection::make( $this->dependencies )
			->filter( fn ( $effect ) => ! empty( $effect['terms'] ) )
			->map( fn ( $effect ) => [
				'relation' => $effect['relation'],
				'terms' => Collection::make( $effect['terms'] )
					->map( fn ( Term $term ) => $term->get() )
					->all()
			] )
			->all();
	}
}
