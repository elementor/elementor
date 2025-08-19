<?php
namespace Elementor\Modules\CssConverter;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class CSS_Converter_Autoloader {
	private static $vendor_autoload_loaded = false;
	private static $autoload_path = null;

	public static function register() {
		if ( ! self::$vendor_autoload_loaded ) {
			self::$autoload_path = __DIR__ . '/vendor/autoload.php';

			if ( file_exists( self::$autoload_path ) ) {
				require_once self::$autoload_path;
				self::$vendor_autoload_loaded = true;
			} else {
				add_action( 'admin_notices', [ __CLASS__, 'missing_dependency_notice' ] );
			}
		}
	}

	public static function is_loaded(): bool {
		return self::$vendor_autoload_loaded;
	}

	public static function missing_dependency_notice() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		echo '<div class="notice notice-error"><p>';
		echo '<strong>Elementor CSS Converter:</strong> ';
		echo 'Missing required dependencies. Please run <code>composer install</code> in the ';
		echo '<code>plugins/elementor/modules/css-converter/</code> directory.';
		echo '</p></div>';
	}

	public static function get_autoload_path(): ?string {
		return self::$autoload_path;
	}
}
