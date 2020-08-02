<?php
namespace Elementor\Core\Frontend\RenderModes;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Render_Mode_Normal extends Render_Mode_Base {
	public static function get_name() {
		return 'normal';
	}
}
