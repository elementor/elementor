<?php
namespace Elementor\Tests\Phpunit\Includes\Base\Mock;

use Elementor\Skin_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Mock_Skin extends Skin_Base {
	public function get_id() {
		return 'mock-skin';
	}

	public function get_title() {
		return 'mock-skin';
	}

	public function render() {
		echo 'render_skin';
	}

	public function render_static() {
		echo 'render_skin_static';
	}
}
