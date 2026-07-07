<?php

if ( ! class_exists( '\ElementorPro\License\API' ) ) {
	// phpcs:ignore Generic.Files.OneObjectStructurePerFile.MultipleFound
	class Mock_Pro_License_API {
		private static bool $active = true;
		private static bool $expired = false;
		private static string $plan_type = 'essential';

		public static function reset(): void {
			self::$active = true;
			self::$expired = false;
			self::$plan_type = 'essential';
		}

		public static function set_license_state( bool $active, bool $expired = false ): void {
			self::$active = $active;
			self::$expired = $expired;
		}

		public static function set_plan_type( string $plan_type ): void {
			self::$plan_type = $plan_type;
		}

		public static function is_license_active(): bool {
			return self::$active;
		}

		public static function is_license_expired(): bool {
			return self::$expired;
		}

		public static function get_plan_type(): string {
			if ( ! self::is_license_active() ) {
				return 'free';
			}

			return self::$plan_type;
		}
	}

	class_alias( 'Mock_Pro_License_API', 'ElementorPro\License\API' );
}
