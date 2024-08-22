<?php
namespace Elementor\Tests\Phpunit\Elementor\Modules\System_Info\Reporters;

use Elementor\Modules\System_Info\Reporters\Server;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Server extends Elementor_Test_Base {

	const DIR_PATH = __DIR__ . '/mock-test-dir';

	public static function setUpBeforeClass(): void {
		parent::setUpBeforeClass();

		mkdir( static::DIR_PATH );
	}

	public static function tearDownAfterClass(): void {
		parent::tearDownAfterClass();

		chmod( static::DIR_PATH, 0777 );
		rmdir( static::DIR_PATH );
	}

	/**
	 * @dataProvider get_path_permissions_data_provider
	 */
	public function test_get_path_permissions( $permission_code, $expected ) {
		if ( 0 === stripos( PHP_OS, 'WIN' ) ) {
			$this->markTestSkipped( 'This test is not available on Windows.' );
		}

		// Arrange
		chmod( static::DIR_PATH, $permission_code );

		clearstatcache();

		// Act
		$permissions = ( new Server() )->get_path_permissions( static::DIR_PATH );

		// Assert
		$this->assertEquals( $expected, $permissions );
	}

	public function get_path_permissions_data_provider() {
		return [
			'no_permissions' => [
				'permission_code' => 0000,
				'expected' => [
					'exists' => true,
					'read' => false,
					'write' => false,
					'execute' => false,
				],
			],
			'readable' => [
				'permission_code' => 0400,
				'expected' => [
					'exists' => true,
					'read' => true,
					'write' => false,
					'execute' => false,
				],
			],
			'readable_writeable' => [
				'permission_code' => 0600,
				'expected' => [
					'exists' => true,
					'read' => true,
					'write' => true,
					'execute' => false,
				],
			],
			'readable_writeable_executable' => [
				'permission_code' => 0700,
				'expected' => [
					'exists' => true,
					'read' => true,
					'write' => true,
					'execute' => true,
				],
			],
		];
	}

	public function test_get_path_permissions__empty_path() {
		// Act
		$permissions = ( new Server() )->get_path_permissions( '' );

		// Assert
		$expected_permissions = [
			'exists' => false,
			'read' => false,
			'write' => false,
			'execute' => false,
		];

		$this->assertEquals( $expected_permissions, $permissions );
	}
}
