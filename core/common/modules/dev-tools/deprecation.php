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
	 * Since `get_total_major` cannot determine how much really versions between 3.2.0 and 3.3.0 if there is 2.10.0 version for example,
	 * versions with major2 more then 9 will be added to total.
	 *
	 * @param array $parsed_version
	 *
	 * @return int
	 */
	public function get_total_major( $parsed_version ) {
		$major1 = $parsed_version['major1'];
		$major2 = $parsed_version['major2'];
		$major2 = $major2 > 9 ? 9 : $major2;
		$minor = 0;

		$total = intval( "{$major1}{$major2}{$minor}" );

		if ( $total > 99 ) {
			$total = $total / 10;
		} else {
			$total = intval( $total / 10 );
		}

		if ( $parsed_version['major2'] > 9 ) {
			$total += $parsed_version['major2'] - 9;
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

		$version['total'] = $this->get_total_major( $version ) + $count;

		$total = $version['total'];

		if ( $total > 9 ) {
			$version['major1'] = intval( $total / 10 );
			$version['major2'] = $total % 10;
		} else {
			$version['major1'] = 0;
			$version['major2'] = $total;
		}

		$version['minor'] = 0;

		return $this->implode_version( $version );
	}

	/**
	 * Implode parsed version to string version.
	 *
	 * @param object $parsed_version
	 *
	 * @return string
	 */
	public function implode_version( $parsed_version ) {
		$major1 = $parsed_version['major1'];
		$major2 = $parsed_version['major2'];
		$minor = $parsed_version['minor'];

		return "{$major1}.{$major2}.{$minor}";
	}

	/**
	 * Parse version('0.0.0') to an informative array.
	 *
	 * @param string $version
	 *
	 * @return array|false
	 */
	public function parse_version( $version ) {
		$version_explode = explode( '.', $version );

		if ( count( $version_explode ) != 3 ) {
			trigger_error( 'Invalid Semantic Version string provided' );

			return false;
		}

		list( $major1, $major2, $minor ) = $version_explode;

		return [
			'major1' => intval( $major1 ),
			'major2' => intval( $major2 ),
			'minor' => intval( $minor ),
		];
	}

	/**
	 * Compare two versions, result is equal to diff of major versions.
	 * Notice: If you want to compare between 3.2.0 and 3.3.0, and there is also a 2.10.0 version, you cannot get the right comparison
	 * Since $this->deprecation->get_total_major cannot determine how much really versions between 3.2.0 and 3.3.0.
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
			$versions = [ &$version1, &$version2 ];

			foreach ( $versions as $key => &$version ) {
				$version['total'] = self::get_total_major( $version );
			}

			return $version1['total'] - $version2['total'];
		}

		return false;
	}

	public function deprecated_function( $function, $version, $replacement = '', $base_version = null ) {
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
