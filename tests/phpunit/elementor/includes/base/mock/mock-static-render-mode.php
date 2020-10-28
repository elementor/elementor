<?php
namespace Elementor\Tests\Phpunit\Includes\Base\Mock;

use Elementor\Core\Frontend\RenderModes\Render_Mode_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Mock_Static_Render_Mode extends Render_Mode_Base {
	public static function get_name() {
		return 'mock';
	}

	public function get_permissions_callback() {
		return true;
	}

	public function is_static() {
		return true;
	}
}
