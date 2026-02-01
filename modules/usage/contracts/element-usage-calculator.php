<?php

namespace Elementor\Modules\Usage\Contracts;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

interface Element_Usage_Calculator {
	public function can_calculate( array $element, $element_instance ): bool;

	public function calculate( array $element, $element_instance, array $existing_usage ): array;
}
