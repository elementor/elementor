<?php
namespace Elementor\Tests\Phpunit\Includes\Settings;

use Elementor\Core\Files\Manager as Files_Manager;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_AJAX;
use ElementorEditorTesting\Traits\Auth_Helpers;

/**
 * The replace URL action is not tested for happy flow because it's not testable.
 */
class Test_Tools extends Elementor_Test_AJAX {
	use Auth_Helpers;

	public function setUp() {
		parent::setUp();

		// TODO: HACK - Avoid register reports to make sure the 'tests/phpunit/elementor/schemas/test-usage.php' not fail.
		remove_all_actions( 'admin_init' );
	}

	public function test_ajax_elementor_recreate_kit() {
		// Arrange
		$this->act_as_admin();

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
		$this->act_as_admin();

		$action = 'elementor_recreate_kit';

		$this->remove_default_kit();

		// Act
		$response = $this->_handleAjaxAndDecode( $action );

		// Assert
		$this->assertNull( $response );
	}

	public function test_ajax_elementor_recreate_kit__unauthorized_user() {
		// Arrange
		$this->act_as_editor();

		$action = 'elementor_recreate_kit';
		$_POST['_nonce'] = wp_create_nonce( $action );

		$this->remove_default_kit();

		// Act
		$response = $this->_handleAjaxAndDecode( $action );

		// Assert
		$this->assertEquals( false, $response['success'] );
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

	public function test_ajax_elementor_clear_cache__without_nonce() {
		// Arrange
		$this->act_as_admin();

		$action = 'elementor_clear_cache';

		// Act
		$response = $this->_handleAjaxAndDecode( $action );

		// Assert
		$this->assertNull( $response );
	}

	public function test_ajax_elementor_clear_cache__unauthorized_user() {
		// Arrange
		$this->act_as_editor();

		$action = 'elementor_clear_cache';
		$_POST['_nonce'] = wp_create_nonce( $action );

		// Act
		$response = $this->_handleAjaxAndDecode( $action );

		// Assert
		$this->assertEquals( false, $response['success'] );
	}

	public function test_ajax_elementor_clear_cache() {
		// Arrange
		$this->act_as_admin();

		$mock = $this->getMockBuilder( Files_Manager::class )
			->setMethods( [ 'clear_cache' ] )
			->getMock();

		$original_files_manager = Plugin::$instance->files_manager;

		Plugin::$instance->files_manager = $mock;

		$action = 'elementor_clear_cache';
		$_POST['_nonce'] = wp_create_nonce( $action );

		// Expect
		$mock->expects( $this->once() )->method( 'clear_cache' );

		// Act
		$this->_handleAjaxAndDecode( $action );

		// Cleanup.
		Plugin::$instance->files_manager = $original_files_manager;
	}

	public function test_ajax_elementor_replace_url__without_nonce() {
		// Arrange
		$this->act_as_admin();

		$action = 'elementor_replace_url';

		// Act
		$response = $this->_handleAjaxAndDecode( $action );

		// Assert
		$this->assertNull( $response );
	}

	public function test_ajax_elementor_replace_url__unauthorized_user() {
		// Arrange
		$this->act_as_editor();

		$action = 'elementor_replace_url';
		$_POST['_nonce'] = wp_create_nonce( $action );

		// Act
		$response = $this->_handleAjaxAndDecode( $action );

		// Assert
		$this->assertEquals( false, $response['success'] );
	}
}
