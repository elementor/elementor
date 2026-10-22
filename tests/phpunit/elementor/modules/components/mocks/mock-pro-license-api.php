<?php

if ( ! class_exists( '\ElementorPro\License\API' ) ) {
	// phpcs:ignore Generic.Files.OneObjectStructurePerFile.MultipleFound
	class Mock_Pro_License_API {
		private static bool $active = true;
		private static bool $expired = false;
		private static array $features = [];
		private static string $access_tier = 'essential-oct2023';

		public static function reset(): void {
			self::$active = true;
			self::$expired = false;
			self::$features = [];
			self::$access_tier = 'essential-oct2023';
		}

		public static function set_access_tier( string $access_tier ): void {
			self::$access_tier = $access_tier;
		}

		public static function get_access_tier(): string {
			return self::$active ? self::$access_tier : 'free';
		}

		public static function set_license_state( bool $active, bool $expired = false ): void {
			self::$active = $active;
			self::$expired = $expired;
		}

		public static function set_features( array $features ): void {
			self::$features = $features;
		}

		public static function is_license_active(): bool {
			return self::$active;
		}

		public static function is_license_expired(): bool {
			return self::$expired;
		}

		public static function is_licence_has_feature( $feature_name, $license_check_validator = null ): bool {
			unset( $license_check_validator );

			return in_array( $feature_name, self::$features, true );
		}
	}

	class_alias( 'Mock_Pro_License_API', 'ElementorPro\License\API' );
}
