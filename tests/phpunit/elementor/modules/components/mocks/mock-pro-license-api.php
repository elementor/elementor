<?php

if ( ! defined( 'ELEMENTOR_PRO_VERSION' ) ) {
	define( 'ELEMENTOR_PRO_VERSION', '99.0.0' );
}

if ( ! class_exists( '\ElementorPro\License\API' ) ) {
	// phpcs:ignore Generic.Files.OneObjectStructurePerFile.MultipleFound
	class Mock_Pro_License_API {
		private static bool $active = true;
		private static bool $expired = false;

		public static function set_license_state( bool $active, bool $expired = false ): void {
			self::$active = $active;
			self::$expired = $expired;
		}

		public static function is_license_active(): bool {
			return self::$active;
		}

		public static function is_license_expired(): bool {
			return self::$expired;
		}
	}

	class_alias( 'Mock_Pro_License_API', 'ElementorPro\License\API' );
}
