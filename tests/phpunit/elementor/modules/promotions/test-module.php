<?php
namespace Elementor\Tests\Phpunit\Elementor\Modules\Promotions;

use Elementor\Modules\Promotions\Module;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/../../components/mocks/mock-pro-license-api.php';

class Test_Module extends Elementor_Test_Base {
	private bool $pro_version_was_defined = false;

	public function set_up() {
		parent::set_up();

		$this->pro_version_was_defined = defined( 'ELEMENTOR_PRO_VERSION' );

		if ( ! $this->pro_version_was_defined ) {
			define( 'ELEMENTOR_PRO_VERSION', '99.99.99' );
		}

		\Mock_Pro_License_API::reset();
		\Mock_Pro_License_API::set_license_state( true );
	}

	public function tear_down() {
		\Mock_Pro_License_API::reset();

		parent::tear_down();
	}

	public function test_is_active__returns_true_when_pro_license_is_active() {
		// Arrange
		\Mock_Pro_License_API::set_license_state( true );

		// Act
		$is_active = Module::is_active();

		// Assert
		$this->assertTrue( $is_active );
	}

	public function test_is_active__returns_true_when_pro_license_is_inactive() {
		// Arrange
		\Mock_Pro_License_API::set_license_state( false );

		// Act
		$is_active = Module::is_active();

		// Assert
		$this->assertTrue( $is_active );
	}

	public function test_enqueue_react_data__enqueues_script_for_editor_without_manage_options() {
		// Arrange
		$this->act_as_editor();
		$module = new Module();

		// Act
		$module->enqueue_react_data();

		// Assert
		$this->assertContains( 'e-react-promotions', wp_scripts()->queue );
	}

	public function test_add_v4_promotions_data__does_not_require_manage_options() {
		// Arrange
		$this->act_as_editor();
		$module = new Module();

		// Act
		$settings = $module->add_v4_promotions_data( [] );

		// Assert
		$this->assertArrayHasKey( 'v4Promotions', $settings );
	}
}
