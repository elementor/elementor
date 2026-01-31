<?php

namespace Elementor\Modules\Usage;

use Elementor\Core\Utils\Collection;
use Elementor\Modules\Usage\Contracts\Element_Usage_Calculator;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Element_Usage_Calculator_Registry extends Collection {

	private ?Element_Usage_Calculator $fallback = null;

	/**
	 * Register a calculator with a given key and priority.
	 *
	 * @param string                   $key        Unique identifier for this calculator.
	 * @param Element_Usage_Calculator $calculator The calculator instance.
	 * @param int                      $priority   Lower numbers = higher priority. Default 10.
	 *
	 * @return self
	 */
	public function register( string $key, Element_Usage_Calculator $calculator, int $priority = 10 ): self {
		$this->items[ $key ] = [
			'calculator' => $calculator,
			'priority' => $priority,
		];

		return $this;
	}

	/**
	 * Register a fallback calculator to use when no other calculator can handle the element.
	 *
	 * @param Element_Usage_Calculator $calculator The fallback calculator.
	 *
	 * @return self
	 */
	public function register_fallback( Element_Usage_Calculator $calculator ): self {
		$this->fallback = $calculator;

		return $this;
	}

	/**
	 * Get the appropriate calculator for the given element.
	 *
	 * Iterates through registered calculators in priority order and returns the first
	 * one that can handle the element. Falls back to the fallback calculator if none match.
	 *
	 * @param array $element          The element data array.
	 * @param mixed $element_instance The widget or element instance.
	 *
	 * @return Element_Usage_Calculator|null
	 */
	public function get_calculator_for( array $element, $element_instance ): ?Element_Usage_Calculator {
		$sorted = $this->items;

		uasort( $sorted, function ( $a, $b ) {
			return $a['priority'] <=> $b['priority'];
		} );

		foreach ( $sorted as $item ) {
			if ( $item['calculator']->can_calculate( $element, $element_instance ) ) {
				return $item['calculator'];
			}
		}

		return $this->fallback;
	}
}
