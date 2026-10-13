<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Core\Settings\Page\Manager as Page_Settings_Manager;
use Elementor\Modules\Mcp\Abilities\Utils\Document_Revision_Snapshots;
use Elementor\Modules\Mcp\Module as Mcp_Module;
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
class Test_Document_Revision_Snapshots extends Elementor_Test_Base {

	use Revision_Test_Helpers;

	private Fake_Elements_Write_Ability $ability;

	private ?string $original_experiment_state = null;

	public function setUp(): void {
		parent::setUp();

		$this->act_as_admin();
		$this->register_revision_snapshots();
		$this->ability = new Fake_Elements_Write_Ability();
	}

	public function tearDown(): void {
		if ( null !== $this->original_experiment_state ) {
			$this->set_revision_snapshots_experiment( $this->original_experiment_state );
		}

		parent::tearDown();
	}

	public function test_write__returns_the_revision_holding_the_previous_state() {
		// Arrange
		$post_id = $this->create_elementor_page( 'publish', $this->containers( 1 ) );

		// Act
		$result = $this->ability->execute_guarded( [ 'post_id' => $post_id, 'elements' => $this->containers( 2 ) ] );

		// Assert
		$this->assertCount( 1, $this->elements_of( $result['undo_revision_id'] ) );
		$this->assertStringContainsString( (string) $result['undo_revision_id'], $result['llm_instructions'] );
	}

	public function test_write__reuses_the_latest_revision_when_it_matches_the_current_state() {
		// Arrange
		$post_id = $this->create_elementor_page( 'draft', $this->containers( 1 ) );
		$revisions_before = count( $this->regular_revision_ids( $post_id ) );

		// Act
		$first = $this->ability->execute_guarded( [ 'post_id' => $post_id, 'elements' => $this->containers( 2 ) ] );
		$second = $this->ability->execute_guarded( [ 'post_id' => $post_id, 'elements' => $this->containers( 3 ) ] );

		// Assert
		$this->assertCount( $revisions_before + 2, $this->regular_revision_ids( $post_id ), 'Each draft write must add only its own post-save revision.' );
		$this->assertCount( 1, $this->elements_of( $first['undo_revision_id'] ) );
		$this->assertCount( 2, $this->elements_of( $second['undo_revision_id'] ) );
	}

	public function test_write__captures_state_that_no_revision_holds_yet() {
		// Arrange
		$post_id = $this->create_elementor_page( 'draft', $this->containers( 1 ) );
		update_post_meta( $post_id, Page_Settings_Manager::META_KEY, [ 'hide_title' => 'yes' ] );

		// Act
		$result = $this->ability->execute_guarded( [ 'post_id' => $post_id, 'elements' => $this->containers( 2 ) ] );

		// Assert
		$this->assertSame(
			[ 'hide_title' => 'yes' ],
			get_post_meta( $result['undo_revision_id'], Page_Settings_Manager::META_KEY, true )
		);
		$this->assertCount( 1, $this->elements_of( $result['undo_revision_id'] ) );
	}

	public function test_write__leaves_no_revision_behind_when_nothing_was_saved() {
		// Arrange
		$post_id = $this->create_elementor_page( 'draft', $this->containers( 1 ) );
		update_post_meta( $post_id, Page_Settings_Manager::META_KEY, [ 'hide_title' => 'yes' ] );
		$revisions_before = $this->regular_revision_ids( $post_id );

		// Act
		$result = $this->ability->execute_guarded( [ 'post_id' => $post_id ] );

		// Assert
		$this->assertSame( $revisions_before, $this->regular_revision_ids( $post_id ) );
		$this->assertArrayNotHasKey( 'undo_revision_id', $result );
	}

	public function test_write__skips_the_snapshot_when_the_filter_disables_it() {
		// Arrange
		$post_id = $this->create_elementor_page( 'draft', $this->containers( 1 ) );
		add_filter( 'elementor/mcp/revision_snapshots/enabled', '__return_false' );

		// Act
		$result = $this->ability->execute_guarded( [ 'post_id' => $post_id, 'elements' => $this->containers( 2 ) ] );

		// Assert
		$this->assertSame( 'success', $result['status'] );
		$this->assertArrayNotHasKey( 'undo_revision_id', $result );
	}

	public function test_write__skips_the_snapshot_and_the_undo_tool_when_the_experiment_is_off() {
		// Arrange
		$post_id = $this->create_elementor_page( 'draft', $this->containers( 1 ) );
		$this->set_revision_snapshots_experiment( Experiments_Manager::STATE_INACTIVE );

		// Act
		$result = $this->ability->execute_guarded( [ 'post_id' => $post_id, 'elements' => $this->containers( 2 ) ] );
		$registered_ids = array_map(
			fn( $ability ) => $ability->get_id(),
			Mcp_Module::build_core_registry()->all()
		);

		// Assert
		$this->assertArrayNotHasKey( 'undo_revision_id', $result );
		$this->assertNotContains( 'elementor/manage-revisions', $registered_ids );
	}

	public function test_write__returns_no_undo_point_when_the_document_did_not_change() {
		// Arrange
		$post_id = $this->create_elementor_page( 'publish', $this->containers( 1 ) );
		update_post_meta( $post_id, Page_Settings_Manager::META_KEY, [ 'hide_title' => 'yes' ] );
		$revisions_before = $this->regular_revision_ids( $post_id );

		// Act
		$result = $this->ability->execute_guarded( [ 'post_id' => $post_id, 'elements' => $this->containers( 1 ) ] );

		// Assert
		$this->assertSame( 'success', $result['status'] );
		$this->assertArrayNotHasKey( 'undo_revision_id', $result );
		$this->assertSame( $revisions_before, $this->regular_revision_ids( $post_id ) );
	}

	public function test_write__leaves_no_revision_behind_when_the_operation_throws() {
		// Arrange
		$post_id = $this->create_elementor_page( 'draft', $this->containers( 1 ) );
		update_post_meta( $post_id, Page_Settings_Manager::META_KEY, [ 'hide_title' => 'yes' ] );
		$revisions_before = $this->regular_revision_ids( $post_id );
		$thrown = null;

		// Act
		try {
			$this->ability->execute_guarded( [ 'post_id' => $post_id, 'throw' => true ] );
		} catch ( \RuntimeException $e ) {
			$thrown = $e;
		}

		// Assert
		$this->assertInstanceOf( \RuntimeException::class, $thrown );
		$this->assertSame( $revisions_before, $this->regular_revision_ids( $post_id ) );
	}

	public function test_write__marks_the_returned_revision_as_an_undo_point() {
		// Arrange
		$post_id = $this->create_elementor_page( 'draft', $this->containers( 1 ) );

		// Act
		$result = $this->ability->execute_guarded( [ 'post_id' => $post_id, 'elements' => $this->containers( 2 ) ] );

		// Assert
		$this->assertTrue( Document_Revision_Snapshots::is_undo_point( $result['undo_revision_id'] ) );
		$this->assertFalse( Document_Revision_Snapshots::is_undo_point( $this->latest_revision_id( $post_id ) ), 'The post-save revision holds the new state, not an undo point.' );
	}

	public function test_write__reports_undo_as_unavailable_when_revisions_are_disabled() {
		// Arrange
		$post_id = $this->create_elementor_page( 'draft', $this->containers( 1 ) );
		add_filter( 'wp_revisions_to_keep', '__return_zero' );

		// Act
		$result = $this->ability->execute_guarded( [ 'post_id' => $post_id, 'elements' => $this->containers( 2 ) ] );

		// Assert
		$this->assertSame( 'success', $result['status'] );
		$this->assertCount( 2, $this->elements_of( $post_id ) );
		$this->assertArrayHasKey( 'undo_revision_id', $result );
		$this->assertNull( $result['undo_revision_id'] );
		$this->assertStringContainsString( 'Undo is unavailable', $result['llm_instructions'] );
	}

	private function set_revision_snapshots_experiment( string $state ): void {
		$experiments = Plugin::$instance->experiments;
		$name = Mcp_Module::REVISION_SNAPSHOTS_EXPERIMENT_NAME;

		if ( null === $this->original_experiment_state ) {
			$feature = $experiments->get_features( $name );
			$this->original_experiment_state = $feature['default'] ?? Experiments_Manager::STATE_ACTIVE;
		}

		$experiments->set_feature_default_state( $name, $state );
		delete_option( Experiments_Manager::OPTION_PREFIX . $name );
	}
}
