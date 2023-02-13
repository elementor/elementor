<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Common\DevTools;

use ElementorEditorTesting\Elementor_Test_Base;
use Elementor\Modules\DevTools\Module;

class Test_Deprecation extends Elementor_Test_Base {
	/**
	 * @var \Elementor\Modules\DevTools\Deprecation
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

	public function test_parse_version_invalid() {
		// Works in PHPUnit 7.5.14 with '@expectedException \PHPUnit\Framework\Error\Notice'.
		$this->markTestSkipped( 'didnt found any solution for handling `trigger_error` in a PHPUnit version that runs in github checks.' );
		return;
		$this->deprecation->parse_version( '0.0' );
		$this->deprecation->parse_version( '0.0.0.0 ' );
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
			[
				'base_version' => '1.0.0',
				'compare_version' => '2.2.2',
				'diff' => -12,
			],
			[
				'base_version' => '1.0.0',
				'compare_version' => '2.2.2.2',
				'diff' => -12,
			],
			[
				'base_version' => '1.0.0',
				'compare_version' => '2.2.2.2-beta1',
				'diff' => -12,
			],
		];

		foreach ( $tests as $test ) {
			$this->assertEquals( $test['diff'], $this->deprecation->compare_version( $test['base_version'], $test['compare_version'] ) );
		}
	}

	public function test_compare_version_major2_higher_then_9() {
		// If you want to compare between 2.9.0 and 3.3.0, and there is also a 2.10.0 version, you cannot get the right comparison!.
		$a_diff = $this->deprecation->compare_version( '2.10.0', '0.0.0' );
		$b_diff = $this->deprecation->compare_version( '3.0.0', '0.0.0' );

		// Since $this->deprecation->get_total_major cannot determine how much really versions between 2.9.0 and 3.3.0.
		$this->assertEquals( $a_diff, $b_diff, 'They should be the same' );
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

	public function test_deprecated_function_soft() {
		$this->deprecation->deprecated_function( __FUNCTION__, '0.0.0', '', '0.4.0' );

		$settings = $this->deprecation->get_settings();

		$this->assertEquals( [
			'0.0.0',
			'',
		], $settings['soft_notices']['test_deprecated_function_soft'] );
	}

	public function test_do_deprecated_action() {
		add_action( 'elementor/test/deprecated_action', function() {
			echo 'Testing Do Deprecated Action';
		} );

		ob_start();

		$this->deprecation->do_deprecated_action( 'elementor/test/deprecated_action', [], '0.0.0', '', '0.5.0' );

		$result = ob_get_clean();

		$this->assertEquals( $result, 'Testing Do Deprecated Action' );
	}

	public function test_do_deprecated_action__soft() {
		add_action( 'elementor/test/deprecated_action_soft', function() {
			echo 'Testing Do Deprecated Action';
		} );

		ob_start();

		$this->deprecation->do_deprecated_action( 'elementor/test/deprecated_action_soft', [], '0.0.0', '', '0.4.0' );

		ob_get_clean();

		$settings = $this->deprecation->get_settings();

		$this->assertEquals( [
			'0.0.0',
			'',
		], $settings['soft_notices']['elementor/test/deprecated_action_soft'] );
	}

	public function test_apply_deprecated_filter__without_filter() {
		// Arrange.
		$hook = 'elementor/test/deprecated_filter';

		// Act.
		$result = $this->deprecation->apply_deprecated_filter( $hook, [ 'elementor' ], '0.0.0', '', '0.5.0' );

		// Assert.
		$this->assertEquals( 'elementor', $result );
	}

	public function test_apply_deprecated_filter__with_string_as_arg_and_without_filter() {
		// Arrange.
		$hook = 'elementor/test/deprecated_filter';

		// Act.
		$result = $this->deprecation->apply_deprecated_filter( $hook, 'elementor', '0.0.0', '', '0.5.0' );

		// Assert.
		$this->assertEquals( 'elementor', $result );
	}

	public function test_apply_deprecated_filter__with_string_as_arg_and_filter() {
		// Arrange.
		$hook = 'elementor/test/deprecated_filter';

		add_filter( $hook, function( $value ) {
			return $value . '-test';
		} );

		// Act.
		$result = $this->deprecation->apply_deprecated_filter( $hook, 'elementor', '0.0.0', '', '0.5.0' );

		// Assert.
		$this->assertEquals( 'elementor-test', $result );
	}

	public function test_apply_deprecated_filter__with_empty_args_array() {
		// Arrange.
		$hook = 'elementor/test/deprecated_filter';

		// Act.
		$result = $this->deprecation->apply_deprecated_filter( $hook, [], '0.0.0', '', '0.5.0' );

		// Assert.
		$this->assertNull( $result );
	}

	public function test_apply_deprecated_filter__with_multiple_args_and_without_filter() {
		// Arrange.
		$hook = 'elementor/test/deprecated_filter';

		// Act.
		$result = $this->deprecation->apply_deprecated_filter( $hook, ['elementor', 'elementor-pro'], '0.0.0', '', '0.5.0' );

		// Assert.
		$this->assertEquals( 'elementor', $result );
	}

	public function test_apply_deprecated_filter__with_multiple_args_and_filter() {
		// Arrange.
		$hook = 'elementor/test/deprecated_filter';

		add_filter( $hook, function( $value1, $value2 ) {
			return $value2 . '-test';
		}, 10, 2 );

		// Act.
		$result = $this->deprecation->apply_deprecated_filter( $hook, ['elementor', 'elementor-pro'], '0.0.0', '', '0.5.0' );

		// Assert.
		$this->assertEquals( 'elementor-pro-test', $result );
	}

	public function test_apply_deprecated_filter__with_multiple_args_associative_array() {
		// Arrange.
		$hook = 'elementor/test/deprecated_filter';

		add_filter( $hook, function( $value1, $value2 ) {
			return $value1;
		}, 10, 2 );

		// Act.
		$result = $this->deprecation->apply_deprecated_filter( $hook, [
			'elementor' => 'free',
			'elementor-pro' => 'paid',
		], '0.0.0', '', '0.5.0' );

		// Assert.
		$this->assertEquals( 'free', $result );
	}

	public function test_apply_deprecated_filter() {
		// Arrange.
		$hook = 'elementor/test/deprecated_filter';

		add_filter( $hook, function( $value ) {
			return $value . '-test';
		} );

		// Act.
		$result = $this->deprecation->apply_deprecated_filter( $hook, [ 'elementor' ], '0.0.0', '', '0.5.0' );

		// Assert.
		$this->assertEquals( 'elementor-test', $result );
	}
}
