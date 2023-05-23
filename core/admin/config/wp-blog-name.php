<?php
namespace Elementor\Core\Admin\Config;

use Elementor\Core\Config\WP_Option_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class WP_Blog_Name extends WP_Option_Base {
	public static function get_key(): string {
		return 'blogname';
	}

	public static function get_default(): string {
		return '';
	}

	protected static function validate( $value ): bool {
		return ! empty( $value ) && is_string( $value );
	}
}
