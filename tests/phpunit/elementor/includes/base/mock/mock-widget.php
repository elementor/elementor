<?php

namespace Elementor\Tests\Phpunit\Includes\Base\Mock;

use Elementor\Widget_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}
class Mock_Widget extends Widget_Base {
	public function get_name() {
		return 'mock-widget';
	}

	protected function render() {
		echo 'render';
	}

	protected function render_static() {
		echo 'render_static';
	}
}
