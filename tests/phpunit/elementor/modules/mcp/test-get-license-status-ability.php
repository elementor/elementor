<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Core\Common\Modules\Connect\Module as ConnectModule;
use Elementor\Modules\Mcp\Abilities\Get_License_Status_Ability;
use ElementorEditorTesting\Elementor_Test_Base;
use Mock_Pro_License_API;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/../components/mocks/mock-pro-license-api.php';

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Get_License_Status_Ability extends Elementor_Test_Base {

	private Get_License_Status_Ability $ability;

	public function setUp(): void {
		parent::setUp();
		$this->ability = new Get_License_Status_Ability();
		$this->act_as_admin();
	}

	public function tearDown(): void {
		Mock_Pro_License_API::reset();

		parent::tearDown();
	}

	public function test_execute__reports_active_license_with_tier_and_label() {
		// Arrange
		Mock_Pro_License_API::set_license_state( true );
		Mock_Pro_License_API::set_access_tier( ConnectModule::ACCESS_TIER_EXPERT );

		// Act
		$result = $this->ability->execute();

		// Assert
		$this->assertSame( Get_License_Status_Ability::STATUS_ACTIVE, $result['status'] );
		$this->assertSame( ConnectModule::ACCESS_TIER_EXPERT, $result['tier'] );
		$this->assertSame( 'Expert', $result['label'] );
	}

	public function test_execute__uses_connect_plan_label_for_oct_2023_essential_tier() {
		// Arrange
		Mock_Pro_License_API::set_license_state( true );
		Mock_Pro_License_API::set_access_tier( ConnectModule::ACCESS_TIER_ESSENTIAL_OCT_2023 );

		// Act
		$result = $this->ability->execute();

		// Assert
		$this->assertSame( 'Advanced', $result['label'] );
	}

	public function test_execute__reports_expired_license_as_free_tier() {
		// Arrange
		Mock_Pro_License_API::set_license_state( false, true );

		// Act
		$result = $this->ability->execute();

		// Assert
		$this->assertSame( Get_License_Status_Ability::STATUS_EXPIRED, $result['status'] );
		$this->assertSame( ConnectModule::ACCESS_TIER_FREE, $result['tier'] );
		$this->assertSame( 'Free', $result['label'] );
	}

	public function test_execute__reports_pro_not_installed_as_free_tier() {
		// Arrange
		Mock_Pro_License_API::set_license_state( false );

		// Act
		$result = $this->ability->execute();

		// Assert
		$this->assertSame( Get_License_Status_Ability::STATUS_PRO_NOT_INSTALLED, $result['status'] );
		$this->assertSame( ConnectModule::ACCESS_TIER_FREE, $result['tier'] );
		$this->assertSame( 'Free', $result['label'] );
	}

	public function test_check_permission__rejects_non_admin() {
		// Arrange
		$this->act_as_editor();

		// Act & Assert
		$this->assertFalse( $this->ability->check_permission() );
	}
}
