<?php

namespace Elementor\Tests\Phpunit\Elementor\Core\Logger;

use ElementorEditorTesting\Elementor_Test_Base;

class Test_Manager extends Elementor_Test_Base {

	/**
	 * @var \Elementor\Core\Logger\Manager
	 */
	private $mock_manager;

	public function setUp() {
		// Mock 'shutdown' method to avoid exit.
		$this->mock_manager = $this->getMockBuilder( \Elementor\Core\Logger\Manager::class )
		                           ->setMethods( [ 'shutdown' ] )
		                           ->getMock();
	}

	public function test_rest_error_handler__error_in_elementor_path() {
		// Assert (Expect).
		$this->mock_manager->expects( $this->once() )
		                   ->method( 'shutdown' )
		                   ->with( [
								'type' => 1,
								'message' => 0,
								'file' => __FILE__,
								'line' => 0,
							] );

		// Act.
		$this->mock_manager->rest_error_handler( 1, 0, __FILE__, 0 );
	}

	public function test_rest_error_handler__error_in_non_elementor_path() {
		// Assert (Expect).
		$this->mock_manager->expects( $this->never() )
		                   ->method( 'shutdown' );

		// Act.
		$this->mock_manager->rest_error_handler( 1, 0, 'elementor/experts/files/test', 0 );
	}
}
