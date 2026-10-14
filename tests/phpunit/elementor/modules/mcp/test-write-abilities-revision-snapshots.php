<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Core\Settings\Page\Manager as Page_Settings_Manager;
use Elementor\Modules\Mcp\Abilities\Build_Composition_Ability;
use Elementor\Modules\Mcp\Abilities\Manage_Elements_Ability;
use Elementor\Modules\Mcp\Abilities\Manage_Revisions_Ability;
use Elementor\Modules\Mcp\Abilities\Update_Settings_Ability;
use Elementor\Tests\Phpunit\Modules\Mcp\Fixtures\Revision_Test_Helpers;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/fixtures/revision-test-helpers.php';

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Write_Abilities_Revision_Snapshots extends Elementor_Test_Base {

	use Revision_Test_Helpers;

	const DIV_BLOCK_COUNT = 2;

	public function setUp(): void {
		parent::setUp();

		$this->act_as_admin();
		$this->register_revision_snapshots_experiment();
	}

	public function test_manage_elements__can_be_undone() {
		// Arrange
		$post_id = $this->create_elementor_page( 'draft', $this->div_blocks( self::DIV_BLOCK_COUNT ) );
		$delete = ( new Manage_Elements_Ability() )->execute_guarded( [
			'post_id' => $post_id,
			'operations' => [
				[ 'action' => 'delete', 'element_id' => $this->div_block_id( self::DIV_BLOCK_COUNT ) ],
			],
		] );
		$elements_after_delete = $this->elements_of( $post_id );

		// Act
		$this->restore( $post_id, $delete['undo_revision_id'] );

		// Assert
		$this->assertCount( self::DIV_BLOCK_COUNT - 1, $elements_after_delete );
		$this->assertCount( self::DIV_BLOCK_COUNT, $this->elements_of( $post_id ) );
	}

	public function test_build_composition__can_be_undone() {
		// Arrange
		$post_id = $this->create_elementor_page( 'draft', $this->div_blocks( 1 ) );
		$build = ( new Build_Composition_Ability() )->execute_guarded( [
			'post_id' => $post_id,
			'xml_structure' => '<e-div-block configuration-id="hero"/>',
		] );
		$elements_after_build = $this->elements_of( $post_id );

		// Act
		$this->restore( $post_id, $build['undo_revision_id'] );

		// Assert
		$this->assertCount( 2, $elements_after_build );
		$this->assertCount( 1, $this->elements_of( $post_id ) );
	}

	public function test_build_composition__dry_run_returns_no_undo_point() {
		// Arrange
		$post_id = $this->create_elementor_page( 'draft', $this->div_blocks( 1 ) );
		$revisions_before = $this->regular_revision_ids( $post_id );

		// Act
		$result = ( new Build_Composition_Ability() )->execute_guarded( [
			'post_id' => $post_id,
			'dry_run' => true,
			'xml_structure' => '<e-div-block configuration-id="hero"/>',
		] );

		// Assert
		$this->assertArrayNotHasKey( 'undo_revision_id', $result );
		$this->assertSame( $revisions_before, $this->regular_revision_ids( $post_id ) );
	}

	public function test_update_page_settings__can_be_undone() {
		// Arrange
		$post_id = $this->create_elementor_page( 'draft', $this->div_blocks( 1 ) );
		$update = ( new Update_Settings_Ability() )->execute_guarded( [
			'post_id' => $post_id,
			'settings' => [ 'hide_title' => 'yes' ],
		] );

		// Act
		$this->restore( $post_id, $update['undo_revision_id'] );

		// Assert
		$this->assertIsInt( $update['undo_revision_id'] );
		$this->assertEmpty( get_post_meta( $post_id, Page_Settings_Manager::META_KEY, true ) );
	}

	private function restore( int $post_id, int $revision_id ) {
		return ( new Manage_Revisions_Ability() )->execute_guarded( [
			'action' => Manage_Revisions_Ability::ACTION_RESTORE,
			'post_id' => $post_id,
			'revision_id' => $revision_id,
		] );
	}

	private function div_blocks( int $count ): array {
		return array_map(
			fn( int $position ) => [
				'id' => $this->div_block_id( $position ),
				'elType' => 'e-div-block',
				'settings' => [],
				'elements' => [],
				'isInner' => false,
			],
			range( 1, $count )
		);
	}

	private function div_block_id( int $position ): string {
		return sprintf( 'd%07d', $position );
	}
}
