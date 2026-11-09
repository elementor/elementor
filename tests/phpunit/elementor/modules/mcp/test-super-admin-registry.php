<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Modules\Mcp\Module as Mcp_Module;
use Elementor\Modules\Mcp\Super_Admin\Super_Admin_Settings;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Super_Admin_Registry extends Elementor_Test_Base {

	private const ENABLE_ID = 'elementor/enable-super-admin';
	private const DISABLE_ID = 'elementor/disable-super-admin';
	private const STATUS_ID = 'elementor/get-super-admin-status';

	public function setUp(): void {
		parent::setUp();
		delete_option( Super_Admin_Settings::OPTION );
	}

	public function tearDown(): void {
		delete_option( Super_Admin_Settings::OPTION );
		parent::tearDown();
	}

	public function test_build_core_registry__exposes_enable_when_off() {
		// Arrange
		Super_Admin_Settings::set_enabled( false );

		// Act
		$registry = Mcp_Module::build_core_registry();

		// Assert
		$this->assertNotNull( $registry->find_by_id( self::ENABLE_ID ) );
		$this->assertNull( $registry->find_by_id( self::DISABLE_ID ) );
		$this->assertNotNull( $registry->find_by_id( self::STATUS_ID ) );
	}

	public function test_build_core_registry__exposes_disable_when_on() {
		// Arrange
		Super_Admin_Settings::set_enabled( true );

		// Act
		$registry = Mcp_Module::build_core_registry();

		// Assert
		$this->assertNull( $registry->find_by_id( self::ENABLE_ID ) );
		$this->assertNotNull( $registry->find_by_id( self::DISABLE_ID ) );
		$this->assertNotNull( $registry->find_by_id( self::STATUS_ID ) );
	}
}
