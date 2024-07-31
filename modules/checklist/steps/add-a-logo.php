<?php
namespace Elementor\Modules\Checklist\Steps;

use Elementor\Modules\Checklist\Steps\Step_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Add_A_Logo extends Step_Base {
	protected function step_title() {
		return __( 'Add a logo', 'elementor' );
	}

	protected function step_description() {
		return __( 'some description', 'elementor' );
	}

	protected function step_image_path() {
		// TODO: Implement step_image_path() method.
	}

	protected function stepCTA() {
		// TODO: Implement stepCTA() method.
	}
}
