<?php

namespace Elementor\Testing\Includes;

use Elementor\Core\Editor\Editor;
use Elementor\Heartbeat;
use Elementor\Modules\Mcp\Utils\Editor_Session_Guard;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Includes
 */
class Test_Heartbeat extends Elementor_Test_Base {

	const TEST_POST_ID         = 888;
	const UNSAVED_TRANSIENT_KEY = '_elementor_editor_unsaved_888';
	const MUTATION_TRANSIENT_KEY = '_elementor_mcp_mutation_888';

	private $original_editor;
	private $original_common;

	public function setUp(): void {
		parent::setUp();

		$this->original_editor = Plugin::$instance->editor;
		$this->original_common = Plugin::$instance->common;

		$ajax_mock = $this->getMockBuilder( \stdClass::class )
			->addMethods( [ 'create_nonce' ] )
			->getMock();
		$ajax_mock->method( 'create_nonce' )->willReturn( 'test-nonce' );

		$common_mock = $this->getMockBuilder( \stdClass::class )
			->addMethods( [ 'get_component' ] )
			->getMock();
		$common_mock->method( 'get_component' )->with( 'ajax' )->willReturn( $ajax_mock );

		$editor_mock = $this->getMockBuilder( Editor::class )
			->disableOriginalConstructor()
			->onlyMethods( [ 'get_locked_user', 'lock_post' ] )
			->getMock();
		$editor_mock->method( 'get_locked_user' )->willReturn( null );
		$editor_mock->method( 'lock_post' )->willReturn( null );

		Plugin::$instance->editor = $editor_mock;
		Plugin::$instance->common = $common_mock;
	}

	public function tearDown(): void {
		Plugin::$instance->editor = $this->original_editor;
		Plugin::$instance->common = $this->original_common;

		delete_transient( self::UNSAVED_TRANSIENT_KEY );
		delete_transient( self::MUTATION_TRANSIENT_KEY );

		parent::tearDown();
	}

	public function test_heartbeat_received__sets_unsaved_transient_when_signal_sent() {
		// Arrange
		$data = [
			'elementor_post_lock'   => [ 'post_ID' => self::TEST_POST_ID ],
			'elementor_has_unsaved' => self::TEST_POST_ID,
		];

		// Act
		( new Heartbeat() )->heartbeat_received( [], $data );

		// Assert
		$this->assertNotFalse( get_transient( self::UNSAVED_TRANSIENT_KEY ) );
	}

	public function test_heartbeat_received__clears_unsaved_transient_when_null_signal_sent() {
		// Arrange
		set_transient( self::UNSAVED_TRANSIENT_KEY, 1 );

		$data = [
			'elementor_post_lock'   => [ 'post_ID' => self::TEST_POST_ID ],
			'elementor_has_unsaved' => null,
		];

		// Act
		( new Heartbeat() )->heartbeat_received( [], $data );

		// Assert
		$this->assertFalse( get_transient( self::UNSAVED_TRANSIENT_KEY ) );
	}

	public function test_heartbeat_received__always_injects_mutation_marker_in_response() {
		// Arrange
		set_transient( self::MUTATION_TRANSIENT_KEY, 1234567890 );

		$data = [
			'elementor_post_lock' => [ 'post_ID' => self::TEST_POST_ID ],
		];

		// Act
		$response = ( new Heartbeat() )->heartbeat_received( [], $data );

		// Assert
		$this->assertSame( self::TEST_POST_ID, $response['elementor_mcp_mutation']['post_id'] );
		$this->assertSame( 1234567890, $response['elementor_mcp_mutation']['mutated_at'] );
	}

	public function test_heartbeat_received__mutation_marker_is_zero_when_no_mutation_recorded() {
		// Arrange
		delete_transient( self::MUTATION_TRANSIENT_KEY );

		$data = [
			'elementor_post_lock' => [ 'post_ID' => self::TEST_POST_ID ],
		];

		// Act
		$response = ( new Heartbeat() )->heartbeat_received( [], $data );

		// Assert
		$this->assertSame( 0, $response['elementor_mcp_mutation']['mutated_at'] );
	}
}
