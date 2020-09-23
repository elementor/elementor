<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Common\DevTools;

use Elementor\Core\Common\Modules\DevTools\Module;
use Elementor\Testing\Elementor_Test_Base;

class Test_Deprecation extends Elementor_Test_Base {
	/**
	 * @var \Elementor\Core\Common\Modules\DevTools\Deprecation
	 */
	private $deprecation;

	public function setUp() {
		parent::setUp();

		$this->deprecation = Module::instance()->deprecation;
	}

	private function generate_versions_list( $versions_count = 100 ) {
		$versions = [];

		for ( $i = 0; $i < $versions_count; ++$i ) {
			$versions [] = $this->deprecation->get_next_version( '0.0.0', $i );
		}

		return $versions;
	}

	public function test_get_total_major() {
		$parsed_version = $this->deprecation->parse_version( '5.5.5' );
		$total_major = $this->deprecation->get_total_major( $parsed_version );

		$this->assertEquals( 55, $total_major );

		$parsed_version = $this->deprecation->parse_version( '5.15.5' );
		$total_major = $this->deprecation->get_total_major( $parsed_version );

		$this->assertEquals( 65, $total_major );

		$parsed_version = $this->deprecation->parse_version( '15.15.5' );
		$total_major = $this->deprecation->get_total_major( $parsed_version );

		$this->assertEquals( 165, $total_major );

		$parsed_version = $this->deprecation->parse_version( '15.15.15' );
		$total_major = $this->deprecation->get_total_major( $parsed_version );

		$this->assertEquals( 165, $total_major );
	}

	public function test_get_next_version() {
		$versions = $this->generate_versions_list( 11 );

		$this->assertEquals( [
			0 => '0.0.0',
			1 => '0.1.0',
			2 => '0.2.0',
			3 => '0.3.0',
			4 => '0.4.0',
			5 => '0.5.0',
			6 => '0.6.0',
			7 => '0.7.0',
			8 => '0.8.0',
			9 => '0.9.0',
			10 => '1.0.0',
		], $versions );
	}

	public function test_get_soft_deprecated_version() {
		$this->assertEquals( '3.4.0', $this->deprecation->get_soft_deprecated_version( '3.0.0' ) );
	}

	public function test_get_hard_deprecated_version() {
		$this->assertEquals( '3.8.0', $this->deprecation->get_hard_deprecated_version( '3.0.0' ) );
	}

	public function test_compare_version() {
		$tests = [
			[
				'base_version' => '0.0.0',
				'compare_version' => '0.0.0',
				'diff' => 0,
			],
			[
				'base_version' => '0.1.0',
				'compare_version' => '0.0.0',
				'diff' => 1,
			],
			[
				'base_version' => '0.2.0',
				'compare_version' => '0.0.0',
				'diff' => 2,
			],
			[
				'base_version' => '1.0.0',
				'compare_version' => '0.0.0',
				'diff' => 10,
			],
			[
				'base_version' => '2.0.0',
				'compare_version' => '0.0.0',
				'diff' => 20,
			],
			[
				'base_version' => '3.9.0',
				'compare_version' => '0.0.0',
				'diff' => 39,
			],
			[
				'base_version' => '3.9.0',
				'compare_version' => '0.1.0',
				'diff' => 38,
			],
			[
				'base_version' => '3.9.0',
				'compare_version' => '0.2.0',
				'diff' => 37,
			],
			[
				'base_version' => '3.9.0',
				'compare_version' => '1.0.0',
				'diff' => 29,
			],
			[
				'base_version' => '3.9.0',
				'compare_version' => '1.14.0',
				'diff' => 15,
			],
			[
				'base_version' => '1.0.0',
				'compare_version' => '3.9.0',
				'diff' => -29,
			],
			[
				'base_version' => '1.0.0',
				'compare_version' => '3.15.0',
				'diff' => -35,
			],
		];

		foreach ( $tests as $test ) {
			$this->assertEquals( $test['diff'], $this->deprecation->compare_version( $test['base_version'], $test['compare_version'] ) );
		}
	}

	public function test_compare_version_dynamic() {
		$versions = $this->generate_versions_list();
		$versions_reverse = array_reverse( $versions );
		$count = count( $versions );

		// 0.0.0 - 9.9.0 = -99 initial.
		$dynamic_diff = -99;
		for ( $i = 0; $i < $count; ++$i ) {
			$base_version = $versions[ $i ];
			$compare_version = $versions_reverse[ $i ];

			$diff = $this->deprecation->compare_version( $base_version, $compare_version );

			$this->assertEquals( $dynamic_diff, $diff, "base: '$base_version' cmp: '$compare_version' diff :'$diff'" );

			$dynamic_diff = $dynamic_diff + 2;
		}

		$this->assertEquals( 101, $dynamic_diff );
	}
}
