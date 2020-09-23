<?php
namespace Elementor\Core\Common\Modules\DevTools;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Deprecation {
	const SOFT_VERSIONS_COUNT = 4;
	const HARD_VERSIONS_COUNT = 8;

	private $current_version = null;
	private $deprecated_notices = [];

	public function __construct( $current_version ) {
		$this->current_version = $current_version;
	}

	/**
	 * Get total of major.
	 *
	 * @param object $parsed_version
	 *
	 * @return int
	 */
	public function get_total_major( $parsed_version ) {
		$major2 = $parsed_version->major2;
		$major2 = $major2 > 9 ? 9 : $major2;
		$minor = 0;

		$total = intval( "{$parsed_version->major1}{$major2}{$minor}" );

		if ( $total > 99 ) {
			$total = $total / 10;
		} else {
			$total = intval( $total / 10 );
		}

		if ( $parsed_version->major2 > 9 ) {
			$total += $parsed_version->major2 - 9;
		}

		return $total;
	}

	public function get_notices() {
		return $this->deprecated_notices;
	}

	/**
	 * Get's next version.
	 *
	 * @param string $version
	 * @param int $count
	 *
	 * @return string|false
	 */
	public function get_next_version( $version, $count = 1 ) {
		$version = $this->parse_version( $version );

		if ( ! $version ) {
			return false;
		}

		$version->total = $this->get_total_major( $version );

		$version->total += $count;

		if ( $version->total > 9 ) {
			$version->major1 = intval( $version->total / 10 );
			$version->major2 = intval( $version->total % 10 );
		} else {
			$version->major1 = 0;
			$version->major2 = $version->total;
		}

		$version->minor = 0;

		return $this->implode_version( $version );
	}

	public function get_soft_deprecated_version( $version ) {
		return $this->get_next_version( $version, self::SOFT_VERSIONS_COUNT );
	}

	public function get_hard_deprecated_version( $version ) {
		return $this->get_next_version( $version, self::HARD_VERSIONS_COUNT );
	}

	/**
	 * Implode parsed version to string version.
	 *
	 * @param object $parsed_version
	 *
	 * @return string
	 */
	public function implode_version( $parsed_version ) {
		return "{$parsed_version->major1}.{$parsed_version->major2}.{$parsed_version->minor}";
	}

	/**
	 * Parse version('0.0.0') to an informative object.
	 *
	 * @param string $version
	 *
	 * @return object|false
	 */
	public function parse_version( $version ) {
		$version_explode = explode( '.', $version );

		if ( count( $version_explode ) != 3 ) {
			trigger_error( 'Invalid Semantic Version string provided' );

			return false;
		}

		list( $major1, $major2, $minor ) = $version_explode;

		return (object) [
			'major1' => intval( $major1 ),
			'major2' => intval( $major2 ),
			'minor' => intval( $minor ),
		];
	}

	/**
	 * Compare two versions, result is equal to diff of major versions.
	 *
	 * @param {string} $version1
	 * @param {string} $version2
	 *
	 * @return int|false
	 */
	public function compare_version( $version1, $version2 ) {
		$version1 = self::parse_version( $version1 );
		$version2 = self::parse_version( $version2 );

		if ( $version1 && $version2 ) {
			foreach ( [ $version1, $version2 ] as $version ) {
				$version->total = self::get_total_major( $version );
			}

			return $version1->total - $version2->total;
		}

		return false;
	}

	public function deprecated_function( $function, $version, $replacement, $base_version = null ) {
		if ( null === $base_version ) {
			$base_version = $this->current_version;
		}

		$diff = $this->compare_version( $base_version, $version );

		if ( false === $diff ) {
			trigger_error( 'Invalid deprecated_function diff' );

			return;
		}

		$print_deprecated = false;

		if ( defined( 'WP_DEBUG' ) && WP_DEBUG && $diff <= self::SOFT_VERSIONS_COUNT ) {
			// Soft deprecated.
			$this->deprecated_notices [] = [
				$function,
				$version,
				$replacement,
			];

			if ( defined( 'ELEMENTOR_DEBUG' ) && ELEMENTOR_DEBUG ) {
				$print_deprecated = true;
			}
		} else {
			// Hard deprecated.
			$print_deprecated = true;
		}

		if ( $print_deprecated ) {
			_deprecated_function( $function, $version, $replacement );
		}
	}
}
