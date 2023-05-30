<?php
namespace Elementor\Core\Admin\Config;

use Elementor\Core\Config\WP_Option_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class WP_Page_On_Front extends WP_Option_Base {

	public static function get_key(): string {
		return 'page_on_front';
	}

	public static function get_default(): int {
		return 0;
	}

	public static function get_value(): int {
		return (int) parent::get_value();
	}

	protected static function validate( $value ): bool {
		return is_scalar( $value );
	}

	public static function on_change( $value, $old_value = null ) {
		$int_value = (int) $value;
		$is_a_valid_post_id = $int_value > 0 && (bool) get_post( $int_value );

		if ( $is_a_valid_post_id ) {
			WP_Show_On_Front::set_is_page();
		} else {
			WP_Show_On_Front::set_is_posts();
		}
	}
}
