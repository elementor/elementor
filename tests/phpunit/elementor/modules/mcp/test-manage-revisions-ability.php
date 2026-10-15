<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Core\Settings\Page\Manager as Page_Settings_Manager;
use Elementor\Core\Utils\Document\Document_Mutator;
use Elementor\Modules\History\Revisions_Manager;
use Elementor\Modules\Mcp\Abilities\Manage_Revisions_Ability;
use Elementor\Modules\Mcp\Abilities\Publish_Document_Ability;
use Elementor\Modules\Mcp\Abilities\Update_Settings_Ability;
use Elementor\Modules\Mcp\Abilities\Utils\Document_Revision_Snapshots;
use Elementor\Plugin;
use Elementor\Tests\Phpunit\Modules\Mcp\Fixtures\Fake_Elements_Write_Ability;
use Elementor\Tests\Phpunit\Modules\Mcp\Fixtures\Revision_Test_Helpers;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/fixtures/fake-elements-write-ability.php';
require_once __DIR__ . '/fixtures/revision-test-helpers.php';

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Manage_Revisions_Ability extends Elementor_Test_Base {

	use Revision_Test_Helpers;

	private Fake_Elements_Write_Ability $write_ability;

	private Manage_Revisions_Ability $ability;

	public function setUp(): void {
		parent::setUp();

		$this->act_as_admin();
		$this->register_revision_snapshots_experiment();
		$this->write_ability = new Fake_Elements_Write_Ability();
		$this->ability = new Manage_Revisions_Ability();
	}

	public function test_restore__undoes_and_redoes_a_change_on_a_draft() {
		// Arrange
		$post_id = $this->create_elementor_page( 'draft', $this->containers( 1 ) );
		$write = $this->write_ability->execute_guarded( [ 'post_id' => $post_id, 'elements' => $this->containers( 2 ) ] );

		// Act
		$undo = $this->restore( $post_id, $write['undo_revision_id'] );
		$elements_after_undo = $this->elements_of( $post_id );
		$this->restore( $post_id, $undo['undo_revision_id'] );

		// Assert
		$this->assertIsInt( $write['undo_revision_id'] );
		$this->assertFalse( $undo['staged'] );
		$this->assertCount( 1, $elements_after_undo );
		$this->assertCount( 2, $this->elements_of( $post_id ) );
		$this->assertStringContainsString( 'elementor/manage-revisions', $undo['llm_instructions'] );
	}

	public function test_restore__stages_published_documents_until_publish() {
		// Arrange
		$post_id = $this->create_elementor_page( 'publish', $this->containers( 1 ) );
		$write = $this->write_ability->execute_guarded( [ 'post_id' => $post_id, 'elements' => $this->containers( 2 ) ] );
		$undo = $this->restore( $post_id, $write['undo_revision_id'] );

		// Act
		$redo = $this->restore( $post_id, $undo['undo_revision_id'] );
		$staged_elements = $this->elements_of( $this->find_autosave_id( $post_id ) );
		$live_elements_before_publish = $this->elements_of( $post_id );
		( new Publish_Document_Ability() )->execute_guarded( [ 'post_id' => $post_id ] );

		// Assert
		$this->assertTrue( $undo['staged'] );
		$this->assertTrue( $redo['staged'] );
		$this->assertCount( 2, $staged_elements );
		$this->assertCount( 1, $live_elements_before_publish, 'The live document must stay untouched until publish.' );
		$this->assertCount( 2, $this->elements_of( $post_id ) );
	}

	public function test_restore__restores_an_editor_revision_reused_as_an_undo_point() {
		// Arrange
		$post_id = $this->create_elementor_page( 'draft', $this->containers( 3 ) );
		$editor_revision_id = $this->latest_revision_id( $post_id );
		$write = $this->write_ability->execute_guarded( [ 'post_id' => $post_id, 'elements' => $this->containers( 1 ) ] );

		// Act
		$this->restore( $post_id, $write['undo_revision_id'] );

		// Assert
		$this->assertSame( $editor_revision_id, $write['undo_revision_id'] );
		$this->assertCount( 3, $this->elements_of( $post_id ) );
	}

	public function test_restore__writes_nothing_when_the_document_already_matches_the_undo_point() {
		// Arrange
		$post_id = $this->create_elementor_page( 'publish', $this->containers( 1 ) );
		$write = $this->write_ability->execute_guarded( [ 'post_id' => $post_id, 'elements' => $this->containers( 2 ) ] );
		$this->restore( $post_id, $write['undo_revision_id'] );
		$revisions_before = $this->regular_revision_ids( $post_id );
		$autosave_before = get_post( $this->find_autosave_id( $post_id ) );

		// Act
		$result = $this->restore( $post_id, $write['undo_revision_id'] );

		// Assert
		$this->assertFalse( $result['changed'] );
		$this->assertFalse( $result['staged'] );
		$this->assertArrayNotHasKey( 'undo_revision_id', $result );
		$this->assertSame( $revisions_before, $this->regular_revision_ids( $post_id ) );
		$this->assertSame( $autosave_before->post_modified_gmt, get_post( $autosave_before->ID )->post_modified_gmt );
	}

	public function test_restore__writes_nothing_when_an_empty_page_already_matches_the_undo_point() {
		// Arrange
		$post_id = $this->factory()->post->create( [
			'post_type' => 'page',
			'post_status' => 'draft',
		] );
		Plugin::$instance->documents->get( $post_id, false )->set_is_built_with_elementor( true );
		$this->move_modified_date_to_the_past( $post_id );
		$write = $this->write_ability->execute_guarded( [ 'post_id' => $post_id, 'elements' => $this->containers( 1 ) ] );
		$this->restore( $post_id, $write['undo_revision_id'] );
		$revisions_before = $this->regular_revision_ids( $post_id );

		// Act
		$result = $this->restore( $post_id, $write['undo_revision_id'] );

		// Assert
		$this->assertFalse( $result['changed'] );
		$this->assertArrayNotHasKey( 'undo_revision_id', $result );
		$this->assertSame( $revisions_before, $this->regular_revision_ids( $post_id ) );
	}

	public function test_restore__rejects_a_revision_that_is_not_an_undo_point() {
		// Arrange
		$post_id = $this->create_elementor_page( 'draft', $this->containers( 3 ) );
		$editor_revision_id = $this->latest_revision_id( $post_id );
		Plugin::$instance->documents->get( $post_id, false )->save( [ 'elements' => $this->containers( 1 ) ] );

		// Act
		$result = $this->restore( $post_id, $editor_revision_id );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'not_an_undo_point', $result->get_error_code() );
		$this->assertSame( \WP_Http::BAD_REQUEST, $result->get_error_data()['status'] );
		$this->assertCount( 1, $this->elements_of( $post_id ) );
	}

	public function test_restore__keeps_backslashes_in_restored_meta() {
		// Arrange
		$page_settings = [ 'custom_css' => 'selector:before { content: "\201C"; }' ];
		$post_id = $this->create_elementor_page( 'draft', $this->containers( 1 ) );
		update_post_meta( $post_id, Page_Settings_Manager::META_KEY, wp_slash( $page_settings ) );
		$write = $this->write_ability->execute_guarded( [ 'post_id' => $post_id, 'elements' => $this->containers( 2 ) ] );
		update_post_meta( $post_id, Page_Settings_Manager::META_KEY, [ 'custom_css' => '' ] );

		// Act
		$this->restore( $post_id, $write['undo_revision_id'] );

		// Assert
		$this->assertSame( $page_settings, get_post_meta( $post_id, Page_Settings_Manager::META_KEY, true ) );
	}

	public function test_restore__returns_422_and_changes_nothing_when_the_save_throws() {
		// Arrange
		$post_id = $this->create_elementor_page( 'draft', $this->containers( 1 ) );
		$write = $this->write_ability->execute_guarded( [ 'post_id' => $post_id, 'elements' => $this->containers( 2 ) ] );
		update_post_meta( $post_id, Page_Settings_Manager::META_KEY, [ 'hide_title' => 'yes' ] );
		$undo_points_before = $this->undo_point_ids( $post_id );
		add_action( 'elementor/document/before_save', function () {
			throw new \Exception( 'Simulated save failure.' );
		} );

		// Act
		$result = $this->restore( $post_id, $write['undo_revision_id'] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'restore_failed', $result->get_error_code() );
		$this->assertSame( \WP_Http::UNPROCESSABLE_ENTITY, $result->get_error_data()['status'] );
		$this->assertSame( $undo_points_before, $this->undo_point_ids( $post_id ) );
		$this->assertCount( 2, $this->elements_of( $post_id ) );
		$this->assertSame( [ 'hide_title' => 'yes' ], get_post_meta( $post_id, Page_Settings_Manager::META_KEY, true ) );
	}

	public function test_restore__does_not_leak_the_undo_point_marker_to_the_parent() {
		// Arrange
		$post_id = $this->create_elementor_page( 'draft', $this->containers( 1 ) );
		$write = $this->write_ability->execute_guarded( [ 'post_id' => $post_id, 'elements' => $this->containers( 2 ) ] );

		// Act
		Revisions_Manager::restore_revision( $post_id, $write['undo_revision_id'] );

		// Assert
		$this->assertTrue( Document_Revision_Snapshots::is_undo_point( $write['undo_revision_id'] ) );
		$this->assertFalse( metadata_exists( 'post', $post_id, Document_Revision_Snapshots::UNDO_POINT_META_KEY ) );
	}

	public function test_restore__rejects_a_revision_of_another_post() {
		// Arrange
		$post_id = $this->create_elementor_page( 'draft', $this->containers( 1 ) );
		$other_post_id = $this->create_elementor_page( 'draft', $this->containers( 1 ) );
		$other_write = $this->write_ability->execute_guarded( [ 'post_id' => $other_post_id, 'elements' => $this->containers( 2 ) ] );

		// Act
		$result = $this->restore( $post_id, $other_write['undo_revision_id'] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'revision_mismatch', $result->get_error_code() );
		$this->assertSame( \WP_Http::BAD_REQUEST, $result->get_error_data()['status'] );
	}

	public function test_restore__rejects_an_autosave() {
		// Arrange
		$post_id = $this->create_elementor_page( 'publish', $this->containers( 1 ) );
		$main_document = Plugin::$instance->documents->get( $post_id, false );
		$autosave = Document_Mutator::instance()->save_as_draft( $main_document, $this->containers( 2 ), true );

		// Act
		$result = $this->restore( $post_id, $autosave->get_post()->ID );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'not_an_undo_point', $result->get_error_code() );
		$this->assertSame( \WP_Http::BAD_REQUEST, $result->get_error_data()['status'] );
	}

	public function test_restore__returns_a_redo_point_when_only_page_settings_change() {
		// Arrange
		$post_id = $this->create_elementor_page( 'draft', $this->containers( 1 ) );
		$update = ( new Update_Settings_Ability() )->execute_guarded( [
			'post_id' => $post_id,
			'settings' => [ 'hide_title' => 'yes' ],
		] );
		$undo = $this->restore( $post_id, $update['undo_revision_id'] );

		// Act
		$this->restore( $post_id, $undo['undo_revision_id'] );

		// Assert
		$this->assertIsInt( $undo['undo_revision_id'] );
		$this->assertSame( 'yes', get_post_meta( $post_id, Page_Settings_Manager::META_KEY, true )['hide_title'] ?? null );
	}

	public function test_restore__rejects_users_who_cannot_edit_the_post() {
		// Arrange
		$post_id = $this->create_elementor_page( 'draft', $this->containers( 1 ) );
		$write = $this->write_ability->execute_guarded( [ 'post_id' => $post_id, 'elements' => $this->containers( 2 ) ] );
		wp_set_current_user( $this->factory()->user->create( [ 'role' => 'contributor' ] ) );

		// Act
		$result = $this->restore( $post_id, $write['undo_revision_id'] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'rest_cannot_edit', $result->get_error_code() );
		$this->assertSame( \WP_Http::FORBIDDEN, $result->get_error_data()['status'] );
	}

	public function test_execute__rejects_unknown_actions() {
		// Arrange
		$post_id = $this->create_elementor_page( 'draft', $this->containers( 1 ) );

		// Act
		$result = $this->ability->execute_guarded( [ 'action' => 'delete', 'post_id' => $post_id ] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'invalid_input', $result->get_error_code() );
		$this->assertSame( \WP_Http::BAD_REQUEST, $result->get_error_data()['status'] );
	}

	/**
	 * @return int[]
	 */
	private function undo_point_ids( int $post_id ): array {
		return array_values( array_filter(
			$this->regular_revision_ids( $post_id ),
			[ Document_Revision_Snapshots::class, 'is_undo_point' ]
		) );
	}

	private function restore( int $post_id, int $revision_id ) {
		return $this->ability->execute_guarded( [
			'action' => Manage_Revisions_Ability::ACTION_RESTORE,
			'post_id' => $post_id,
			'revision_id' => $revision_id,
		] );
	}
}
