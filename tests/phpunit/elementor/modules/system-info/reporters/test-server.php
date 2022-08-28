<?php
namespace Elementor\Tests\Phpunit\Elementor\Modules\System_Info\Reporters;

use Elementor\Modules\System_Info\Reporters\Server;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Server extends Elementor_Test_Base {

	const DIR_PATH = __DIR__ . '/mock-test-dir';

	public static function setUpBeforeClass() {
		parent::setUpBeforeClass();

		mkdir( static::DIR_PATH );
	}

	public static function tearDownAfterClass() {
		parent::tearDownAfterClass();

		chmod( static::DIR_PATH, 0777 );
		rmdir( static::DIR_PATH );
	}

	public function test_get_path_permissions__no_permissions() {
		// Arrange
		chmod( static::DIR_PATH, 0000 );

		clearstatcache();

		// Act
		$permissions = ( new Server() )->get_path_permissions( static::DIR_PATH );

		// Assert
		$this->assertFalse( $permissions['read'] );
		$this->assertFalse( $permissions['write'] );
		$this->assertFalse( $permissions['execute'] );
	}

	public function test_get_path_permissions__readable() {
		// Arrange
		chmod( static::DIR_PATH, 0400 );

		clearstatcache();

		// Act
		$permissions = ( new Server() )->get_path_permissions( static::DIR_PATH );

		// Assert
		$this->assertTrue( $permissions['read'] );
		$this->assertFalse( $permissions['write'] );
		$this->assertFalse( $permissions['execute'] );
	}

	public function test_get_path_permissions__readable_writeable() {
		// Arrange
		chmod( static::DIR_PATH, 0600 );

		clearstatcache();

		// Act
		$permissions = ( new Server() )->get_path_permissions( static::DIR_PATH );

		// Assert
		$this->assertTrue( $permissions['read'] );
		$this->assertTrue( $permissions['write'] );
		$this->assertFalse( $permissions['execute'] );
	}

	public function test_get_path_permissions__readable_writeable_executable() {
		// Arrange
		chmod( static::DIR_PATH, 0700 );

		clearstatcache();

		// Act
		$permissions = ( new Server() )->get_path_permissions( static::DIR_PATH );

		// Assert
		$this->assertTrue( $permissions['read'] );
		$this->assertTrue( $permissions['write'] );
		$this->assertTrue( $permissions['execute'] );
	}
}
