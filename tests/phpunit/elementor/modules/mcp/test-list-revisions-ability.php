<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Modules\Mcp\Abilities\List_Revisions_Ability;
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
class Test_List_Revisions_Ability extends Elementor_Test_Base {

	use Revision_Test_Helpers;

	private List_Revisions_Ability $ability;

	public function setUp(): void {
		parent::setUp();

		$this->act_as_admin();
		$this->register_revision_snapshots();
		$this->ability = new List_Revisions_Ability();
	}

	public function test_execute__labels_mcp_and_editor_revisions_newest_first() {
		// Arrange
		$post_id = $this->create_elementor_page( 'draft', $this->containers( 1 ) );
		$editor_revision_id = $this->latest_revision_id( $post_id );
		( new Fake_Elements_Write_Ability() )->execute_guarded( [ 'post_id' => $post_id, 'elements' => $this->containers( 2 ) ] );
		$mcp_revision_id = $this->latest_revision_id( $post_id );

		// Act
		$result = $this->ability->execute( [ 'post_id' => $post_id ] );

		// Assert
		$this->assertSame( $mcp_revision_id, $result['revisions'][0]['revision_id'] );
		$this->assertSame( List_Revisions_Ability::SOURCE_MCP, $result['revisions'][0]['source'] );
		$this->assertSame( Fake_Elements_Write_Ability::ID, $result['revisions'][0]['ability'] );
		$this->assertSame( $editor_revision_id, $result['revisions'][1]['revision_id'] );
		$this->assertSame( List_Revisions_Ability::SOURCE_EDITOR, $result['revisions'][1]['source'] );
		$this->assertNull( $result['revisions'][1]['ability'] );
	}

	public function test_execute__excludes_autosaves() {
		// Arrange
		$post_id = $this->create_elementor_page( 'publish', $this->containers( 1 ) );
		( new Fake_Elements_Write_Ability() )->execute_guarded( [ 'post_id' => $post_id, 'elements' => $this->containers( 2 ) ] );
		$autosave_id = $this->find_autosave_id( $post_id );

		// Act
		$result = $this->ability->execute( [ 'post_id' => $post_id ] );

		// Assert
		$this->assertNotSame( 0, $autosave_id );
		$this->assertNotContains( $autosave_id, array_column( $result['revisions'], 'revision_id' ) );
	}

	public function test_execute__respects_the_limit() {
		// Arrange
		$post_id = $this->create_elementor_page( 'draft', $this->containers( 1 ) );
		( new Fake_Elements_Write_Ability() )->execute_guarded( [ 'post_id' => $post_id, 'elements' => $this->containers( 2 ) ] );

		// Act
		$result = $this->ability->execute( [ 'post_id' => $post_id, 'limit' => 1 ] );

		// Assert
		$this->assertCount( 1, $result['revisions'] );
	}

	public function test_execute__reports_disabled_revisions() {
		// Arrange
		$post_id = $this->create_elementor_page( 'draft', $this->containers( 1 ) );
		add_filter( 'wp_revisions_to_keep', '__return_zero' );

		// Act
		$result = $this->ability->execute( [ 'post_id' => $post_id ] );

		// Assert
		$this->assertSame( [], $result['revisions'] );
		$this->assertArrayHasKey( 'llm_instructions', $result );
	}

	public function test_execute__rejects_users_who_cannot_edit_the_post() {
		// Arrange
		$post_id = $this->create_elementor_page( 'draft', $this->containers( 1 ) );
		wp_set_current_user( $this->factory()->user->create( [ 'role' => 'contributor' ] ) );

		// Act
		$result = $this->ability->execute( [ 'post_id' => $post_id ] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( \WP_Http::FORBIDDEN, $result->get_error_data()['status'] );
	}
}
