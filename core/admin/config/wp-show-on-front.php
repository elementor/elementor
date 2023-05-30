<?php
namespace Elementor\Core\Admin\Config;

use Elementor\Core\Config\Config_Enum_Trait;
use Elementor\Core\Config\WP_Option_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class WP_Show_On_Front extends WP_Option_Base {
	use Config_Enum_Trait;

	const VALUE_PAGE = 'page';
	const VALUE_POSTS = 'posts';

	public static function get_key(): string {
		return 'show_on_front';
	}

	public static function get_options(): array {
		return [
			static::VALUE_PAGE => __( 'Page', 'elementor' ),
			static::VALUE_POSTS => __( 'Posts', 'elementor' ),
		];
	}

	public static function get_default(): string {
		return static::VALUE_POSTS;
	}

	public static function set_is_page() {
		static::set( static::VALUE_PAGE );
	}

	public static function set_is_posts() {
		static::set( static::VALUE_POSTS );
	}

	public static function is_page(): bool {
		return static::get_value() === static::VALUE_PAGE;
	}

	public static function is_posts(): bool {
		return static::get_value() === static::VALUE_POSTS;
	}

	public static function on_change( $value ) {
		if ( static::VALUE_POSTS === $value ) {
			WP_Page_On_Front::delete();
		}
	}
}
