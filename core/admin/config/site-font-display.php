<?php
namespace Elementor\Core\Admin\Config;

use Elementor\Core\Config\Site_Config_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Site_Font_Display extends Site_Config_Base {

	const OPTION_AUTO = 'auto';
	const OPTION_BLOCK = 'block';
	const OPTION_SWAP = 'swap';

	public static function get_key() {
		return 'font_display';
	}

	public static function get_options() {
		return [
			self::OPTION_AUTO => esc_html__( 'Auto', 'elementor' ),
			self::OPTION_BLOCK => esc_html__( 'Block', 'elementor' ),
			self::OPTION_SWAP => esc_html__( 'Swap', 'elementor' ),
		];
	}

	public static function get_default() {
		return self::OPTION_AUTO;
	}

	public static function should_autoload() {
		return true;
	}

	Public static function set_block() {
		static::set( self::OPTION_BLOCK );
	}

	Public static function set_swap() {
		static::set( self::OPTION_SWAP );
	}

	Public static function set_auto() {
		static::set( self::OPTION_AUTO );
	}
}
