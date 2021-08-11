<?php
namespace Elementor\Tests\Phpunit\Includes\Settings;

use Elementor\Plugin;
use Elementor\Testing\Elementor_Test_AJAX;

class Test_Tools extends Elementor_Test_AJAX {
	public function setUp() {
		parent::setUp();

		// TODO: HACK - Avoid register reports to make sure the 'tests/phpunit/elementor/schemas/test-usage.php' not fail.
		remove_all_actions( 'admin_init' );
	}

	public function test_ajax_elementor_recreate_kit() {
		// Arrange
		$action = 'elementor_recreate_kit';

		$this->remove_default_kit();
		$_POST['_nonce'] = wp_create_nonce( $action );

		// Act
		$response = $this->_handleAjaxAndDecode( $action );

		// Assert
		$kit = Plugin::$instance->kits_manager->get_active_kit();

		$this->assertNotNull( $response );
		$this->assertEquals( true, $response['success'] );
		$this->assertNotEquals( 0, $kit->get_id() );
	}

	public function test_ajax_elementor_recreate_kit__without_nonce() {
		// Arrange
		$action = 'elementor_recreate_kit';

		$this->remove_default_kit();

		// Act
		$response = $this->_handleAjaxAndDecode( $action );

		// Assert
		$this->assertNull( $response );
	}

	public function test_ajax_elementor_recreate_kit__when_kit_is_already_exists() {
		// Arrange
		$action = 'elementor_recreate_kit';
		$_POST['_nonce'] = wp_create_nonce( $action );

		// Act
		$response = $this->_handleAjaxAndDecode( $action );

		// Assert
		$this->assertNotNull( $response );
		$this->assertEquals( false, $response['success'] );
	}
}
