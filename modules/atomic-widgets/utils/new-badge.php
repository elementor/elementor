<?php

namespace Elementor\Modules\AtomicWidgets\Utils;

use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class New_Badge {

	/**
	 * Maps atomic element type → the minor version when the "New" badge expires.
	 * Format: 'element-type' => 'major.minor' (patch is ignored during comparison).
	 *
	 * @var array<string, string>
	 */
	private const NEW_ATOMIC_ELEMENTS = [
		'e-background-video' => '4.3',
	];

	public static function should_show_for_element( string $element_name, string $current_version ): bool {
		if ( Utils::is_elementor_tests() ) {
			return false;
		}

		$until_version = self::NEW_ATOMIC_ELEMENTS[ $element_name ] ?? '';

		if ( empty( $until_version ) ) {
			return false;
		}

		return self::is_within_new_window( $current_version, $until_version );
	}

	public static function is_within_new_window( string $current_version, string $until_version ): bool {
		[ $cur_major, $cur_minor ] = self::parse_major_minor( $current_version );
		[ $until_major, $until_minor ] = self::parse_major_minor( $until_version );

		return $cur_major < $until_major || ( $cur_major === $until_major && $cur_minor <= $until_minor );
	}

	/**
	 * @return array{0: int, 1: int}
	 */
	private static function parse_major_minor( string $version ): array {
		$parts = explode( '.', $version );

		return [
			(int) ( $parts[0] ?? 0 ),
			(int) ( $parts[1] ?? 0 ),
		];
	}
}
