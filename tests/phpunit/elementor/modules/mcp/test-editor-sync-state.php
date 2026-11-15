<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Core\Base\Document;
use Elementor\Modules\Mcp\Utils\Editor_Sync_State;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Editor_Sync_State extends Elementor_Test_Base {

	const SECONDS_BEFORE_MUTATION = 60;

	private Editor_Sync_State $sync_state;

	private int $post_id;

	public function setUp(): void {
		parent::setUp();

		$this->act_as_admin();
		$this->sync_state = new Editor_Sync_State();
		$this->post_id = $this->factory()->create_and_get_custom_post( [ 'post_status' => 'draft' ] )->ID;
		Plugin::$instance->documents->get( $this->post_id, false )->set_is_built_with_elementor( true );
	}

	public function tearDown(): void {
		Editor_Sync_State::delete_mcp_mutation( $this->post_id );
		delete_transient( "_elementor_editor_unpersisted_{$this->post_id}" );

		parent::tearDown();
	}

	public function test_handle_unpersisted_signal__sets_transient_to_current_user() {
		// Act
		$this->sync_state->handle_unpersisted_signal( $this->post_id, (string) $this->post_id );

		// Assert
		$this->assertSame( get_current_user_id(), (int) get_transient( "_elementor_editor_unpersisted_{$this->post_id}" ) );
	}

	public function test_handle_unpersisted_signal__empty_value_clears_transient() {
		// Arrange
		Editor_Sync_State::set_editor_unpersisted( $this->post_id );

		// Act
		$this->sync_state->handle_unpersisted_signal( $this->post_id, '' );

		// Assert
		$this->assertFalse( get_transient( "_elementor_editor_unpersisted_{$this->post_id}" ) );
	}

	public function test_check_stale_editor_save__returns_409_when_marker_is_newer_than_last_sync() {
		// Arrange
		Editor_Sync_State::set_mcp_mutation( $this->post_id );

		// Act
		$result = $this->sync_state->check_stale_editor_save( null, null, $this->save_request( [
			'last_synced_at' => time() - self::SECONDS_BEFORE_MUTATION,
		] ) );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'elementor_document_changed_externally', $result->get_error_code() );
		$this->assertSame( \WP_Http::CONFLICT, $result->get_error_data()['status'] );
	}

	/**
	 * @dataProvider allowed_save_provider
	 */
	public function test_check_stale_editor_save__allows_save( bool $has_marker, callable $build_overrides ) {
		// Arrange
		if ( $has_marker ) {
			Editor_Sync_State::set_mcp_mutation( $this->post_id );
		}

		$reference_time = $has_marker ? Editor_Sync_State::get_mcp_mutation_time( $this->post_id ) : time();

		// Act
		$result = $this->sync_state->check_stale_editor_save( null, null, $this->save_request( $build_overrides( $reference_time ) ) );

		// Assert
		$this->assertNull( $result );
	}

	public function allowed_save_provider(): array {
		return [
			'synced at the marker time' => [ true, fn( int $mutated_at ) => [ 'last_synced_at' => $mutated_at ] ],
			'synced after the marker' => [ true, fn( int $mutated_at ) => [ 'last_synced_at' => $mutated_at + self::SECONDS_BEFORE_MUTATION ] ],
			'no last_synced_at' => [ true, fn() => [] ],
			'last_synced_at is zero' => [ true, fn() => [ 'last_synced_at' => 0 ] ],
			'override requested' => [ true, fn( int $mutated_at ) => [
				'last_synced_at' => $mutated_at - self::SECONDS_BEFORE_MUTATION,
				'ignore_external_changes' => true,
			] ],
			'no marker' => [ false, fn( int $now ) => [ 'last_synced_at' => $now - self::SECONDS_BEFORE_MUTATION ] ],
		];
	}

	public function test_on_document_saved__keeps_the_mcp_marker() {
		// Arrange
		Editor_Sync_State::set_mcp_mutation( $this->post_id );

		// Act
		$this->sync_state->on_document_saved( Plugin::$instance->documents->get( $this->post_id ) );

		// Assert
		$this->assertGreaterThan( 0, Editor_Sync_State::get_mcp_mutation_time( $this->post_id ) );
	}

	public function test_ajax_save__rejects_stale_save_without_writing() {
		// Arrange
		$post_id = $this->factory()->create_and_get_custom_post( [ 'post_status' => 'publish' ] )->ID;
		Plugin::$instance->documents->get( $post_id, false )->set_is_built_with_elementor( true );
		Editor_Sync_State::set_mcp_mutation( $post_id );
		$exception = null;

		// Act
		try {
			Plugin::$instance->documents->ajax_save( $this->save_request( [
				'editor_post_id' => $post_id,
				'status' => Document::STATUS_AUTOSAVE,
				'last_synced_at' => time() - self::SECONDS_BEFORE_MUTATION,
			] ) );
		} catch ( \Exception $e ) {
			$exception = $e;
		}

		// Assert
		$this->assertNotNull( $exception );
		$this->assertSame( \WP_Http::CONFLICT, $exception->getCode() );
		$this->assertEmpty( Plugin::$instance->documents->get( $post_id, false )->get_elements_data() );
		$this->assertFalse( wp_get_post_autosave( $post_id ) );

		Editor_Sync_State::delete_mcp_mutation( $post_id );
	}

	public function test_ajax_save__returns_server_time_in_save_response() {
		// Arrange
		$before = time();

		// Act
		$result = Plugin::$instance->documents->ajax_save( $this->save_request( [
			'last_synced_at' => $before,
		] ) );

		// Assert
		$this->assertGreaterThanOrEqual( $before, $result['config']['document']['server_time'] );
	}

	private function save_request( array $overrides ): array {
		return $overrides + [
			'editor_post_id' => $this->post_id,
			'status' => Document::STATUS_DRAFT,
			'elements' => [
				[
					'id' => 'saved1',
					'elType' => 'e-div-block',
					'settings' => [],
					'elements' => [],
				],
			],
			'settings' => [],
		];
	}
}
