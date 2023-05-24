<?php
namespace Elementor\Core\Admin\Config;

use Elementor\Core\Config\Config_Enum_Trait;
use Elementor\Core\Config\Site_Config_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Site_Font_Display extends Site_Config_Base {

	use Config_Enum_Trait;

	const OPTION_AUTO = 'auto';
	const OPTION_BLOCK = 'block';
	const OPTION_SWAP = 'swap';

	public static function get_key(): string {
		return 'font_display';
	}

	public static function get_options(): array {
		return [
			self::OPTION_AUTO => esc_html__( 'Auto', 'elementor' ),
			self::OPTION_BLOCK => esc_html__( 'Block', 'elementor' ),
			self::OPTION_SWAP => esc_html__( 'Swap', 'elementor' ),
		];
	}

	public static function get_default(): string {
		return self::OPTION_AUTO;
	}

	public static function should_autoload(): bool {
		return true;
	}

	public static function set_block() {
		static::set( self::OPTION_BLOCK );
	}

	public static function set_swap() {
		static::set( self::OPTION_SWAP );
	}

	public static function set_auto() {
		static::set( self::OPTION_AUTO );
	}
}
