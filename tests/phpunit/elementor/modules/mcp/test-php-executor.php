<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Modules\Mcp\Super_Admin\Php_Executor;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Php_Executor extends Elementor_Test_Base {

	public function test_execute__restores_error_handler() {
		// Arrange
		$sentinel = static function () {
			return true;
		};
		set_error_handler( $sentinel );

		// Act
		Php_Executor::execute( 'return 1;' );

		// Assert
		$this->assertSame( $sentinel, set_error_handler( null ) );
		restore_error_handler();
	}

	public function test_execute__unbalanced_ob_start_collected_and_level_restored() {
		// Arrange
		$level_before = ob_get_level();
		$code = 'ob_start(); echo "nested";';

		// Act
		$result = Php_Executor::execute( $code );

		// Assert
		$this->assertSame( $level_before, ob_get_level() );
		$this->assertStringContainsString( 'nested', $result['output'] );
	}

	public function test_execute__user_assigning_errors_does_not_replace_result_errors_array() {
		// Act
		$result = Php_Executor::execute( '$errors = "x"; return 1;' );

		// Assert
		$this->assertIsArray( $result['errors'] );
		$this->assertSame( 1, $result['return_value'] );
	}

	public function test_execute__suppressed_warning_not_recorded() {
		// Act
		$result = Php_Executor::execute( '@trigger_error("silent", E_USER_WARNING); return true;' );

		// Assert
		$this->assertTrue( $result['success'] );
		$this->assertSame( [], $result['errors'] );
	}
}
