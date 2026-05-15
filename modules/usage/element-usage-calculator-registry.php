<?php

namespace Elementor\Modules\Usage;

use Elementor\Modules\Usage\Contracts\Element_Usage_Calculator;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Element_Usage_Calculator_Registry {

	/** @var Element_Usage_Calculator[] */
	private array $calculators = [];

	private ?Element_Usage_Calculator $fallback = null;

	/**
	 * @param Element_Usage_Calculator[] $calculators
	 */
	public function __construct( array $calculators = [] ) {
		$this->calculators = $calculators;
	}

	public function set_fallback( Element_Usage_Calculator $calculator ): void {
		$this->fallback = $calculator;
	}

	public function get_calculator_for( array $element, $element_instance ): ?Element_Usage_Calculator {
		foreach ( $this->calculators as $calculator ) {
			if ( $calculator->can_calculate( $element, $element_instance ) ) {
				return $calculator;
			}
		}

		return $this->fallback;
	}
}
