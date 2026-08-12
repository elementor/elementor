<?php

namespace Elementor\Testing\Includes;

use Elementor\Core\Editor\Editor;
use Elementor\Heartbeat;
use Elementor\Modules\Mcp\Utils\Editor_Sync_State;
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

		add_filter( 'elementor/heartbeat/mutation_marker', function( $default, int $post_id ): ?array {
			$mutated_at = Editor_Sync_State::get_mcp_mutation_time( $post_id );
			if ( ! $mutated_at ) {
				return null;
			}
			return [
				'post_id'    => $post_id,
				'mutated_at' => $mutated_at,
			];
		}, 10, 2 );

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
		$this->act_as_admin();
		add_action( 'elementor/heartbeat/unsaved_signal', function( int $post_id, $signal_value ) {
			if ( $signal_value ) {
				Editor_Sync_State::set_editor_unsaved( (int) $signal_value );
			} else {
				Editor_Sync_State::clear_editor_unsaved( $post_id );
			}
		}, 10, 2 );

		// Act
		do_action( 'elementor/heartbeat/unsaved_signal', self::TEST_POST_ID, self::TEST_POST_ID );

		// Assert
		$this->assertNotFalse( get_transient( self::UNSAVED_TRANSIENT_KEY ) );
	}

	public function test_heartbeat_received__clears_unsaved_transient_when_null_signal_sent() {
		// Arrange
		$this->act_as_admin();
		Editor_Sync_State::set_editor_unsaved( self::TEST_POST_ID );
		add_action( 'elementor/heartbeat/unsaved_signal', function( int $post_id, $signal_value ) {
			if ( $signal_value ) {
				Editor_Sync_State::set_editor_unsaved( (int) $signal_value );
			} else {
				Editor_Sync_State::clear_editor_unsaved( $post_id );
			}
		}, 10, 2 );

		// Act
		do_action( 'elementor/heartbeat/unsaved_signal', self::TEST_POST_ID, null );

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

	public function test_heartbeat_received__mutation_marker_absent_when_no_mutation_recorded() {
		// Arrange
		delete_transient( self::MUTATION_TRANSIENT_KEY );

		$data = [
			'elementor_post_lock' => [ 'post_ID' => self::TEST_POST_ID ],
		];

		// Act
		$response = ( new Heartbeat() )->heartbeat_received( [], $data );

		// Assert
		$this->assertArrayNotHasKey( 'elementor_mcp_mutation', $response );
	}

	public function test_heartbeat_response_includes_mcp_mutation_marker() {
		// Arrange
		Editor_Sync_State::set_mcp_mutation( self::TEST_POST_ID );
		$recorded_at = Editor_Sync_State::get_mcp_mutation_time( self::TEST_POST_ID );

		$data = [
			'elementor_post_lock' => [ 'post_ID' => self::TEST_POST_ID ],
		];

		// Act
		$response = ( new Heartbeat() )->heartbeat_received( [], $data );

		// Assert
		$this->assertArrayHasKey( 'elementor_mcp_mutation', $response );
		$this->assertSame( $recorded_at, $response['elementor_mcp_mutation']['mutated_at'] );

		$transient_expiry  = (int) get_option( '_transient_timeout_' . self::MUTATION_TRANSIENT_KEY );
		$expected_expiry   = time() + Editor_Sync_State::MCP_MUTATION_TTL;
		$this->assertEqualsWithDelta( $expected_expiry, $transient_expiry, 2 );
	}
}
