<?php

namespace Elementor\Testing\Modules\AtomicWidgets\Utils;

use Elementor\Modules\AtomicWidgets\Utils\New_Badge;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_New_Badge extends TestCase {

	/**
	 * @dataProvider is_within_new_window_provider
	 */
	public function test_is_within_new_window( string $current_version, string $until_version, bool $expected ): void {
		$this->assertSame( $expected, New_Badge::is_within_new_window( $current_version, $until_version ) );
	}

	public function is_within_new_window_provider(): array {
		return [
			'exact minor match' => [ '4.3.0', '4.3', true ],
			'patch ignored' => [ '4.3.9', '4.3', true ],
			'older minor same major' => [ '4.2.0', '4.3', true ],
			'older major' => [ '3.0.0', '4.3', true ],
			'future minor same major' => [ '4.4.0', '4.3', false ],
			'future major' => [ '5.0.0', '4.3', false ],
		];
	}

	public function test_should_show_for_registered_element(): void {
		if ( defined( 'ELEMENTOR_TESTS' ) && ELEMENTOR_TESTS ) {
			$this->markTestSkipped( 'ELEMENTOR_TESTS is already enabled.' );
		}

		$this->ensure_utils_loaded();

		$this->assertTrue( New_Badge::should_show_for_element( 'e-background-video', '4.3.0' ) );
	}

	public function test_should_show_for_unknown_element(): void {
		if ( defined( 'ELEMENTOR_TESTS' ) && ELEMENTOR_TESTS ) {
			$this->markTestSkipped( 'ELEMENTOR_TESTS is already enabled.' );
		}

		$this->ensure_utils_loaded();

		$this->assertFalse( New_Badge::should_show_for_element( 'e-heading', '4.3.0' ) );
	}

	/**
	 * @runInSeparateProcess
	 * @preserveGlobalState disabled
	 */
	public function test_should_show_for_element_is_false_in_test_mode(): void {
		if ( ! defined( 'ELEMENTOR_TESTS' ) ) {
			define( 'ELEMENTOR_TESTS', true );
		}

		require_once dirname( __DIR__, 6 ) . '/includes/utils.php';

		$this->assertFalse( New_Badge::should_show_for_element( 'e-background-video', '4.3.0' ) );
	}

	private function ensure_utils_loaded(): void {
		if ( ! class_exists( '\Elementor\Utils' ) ) {
			require_once dirname( __DIR__, 6 ) . '/includes/utils.php';
		}
	}
}
