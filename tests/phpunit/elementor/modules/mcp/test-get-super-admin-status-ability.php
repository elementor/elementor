<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Modules\Mcp\Abilities\Get_Super_Admin_Status_Ability;
use Elementor\Modules\Mcp\Super_Admin\Super_Admin_Settings;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Get_Super_Admin_Status_Ability extends Elementor_Test_Base {

	private Get_Super_Admin_Status_Ability $ability;

	public function setUp(): void {
		parent::setUp();
		$this->ability = new Get_Super_Admin_Status_Ability();
		delete_option( Super_Admin_Settings::OPTION );
	}

	public function tearDown(): void {
		delete_option( Super_Admin_Settings::OPTION );
		parent::tearDown();
	}

	public function test_execute__returns_disabled_by_default() {
		// Arrange
		$this->act_as_admin();

		// Act
		$result = $this->ability->execute();

		// Assert
		$this->assertFalse( $result['enabled'] );
	}

	public function test_execute__returns_enabled_when_option_on() {
		// Arrange
		$this->act_as_admin();
		Super_Admin_Settings::set_enabled( true );

		// Act
		$result = $this->ability->execute();

		// Assert
		$this->assertTrue( $result['enabled'] );
	}
}
