<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Core\Settings\Page\Manager as Page_Settings_Manager;
use Elementor\Modules\Mcp\Abilities\Build_Composition_Ability;
use Elementor\Modules\Mcp\Abilities\Manage_Component_Ability;
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

	const POST_ID = 42;

	public function setUp(): void {
		parent::setUp();

		$this->act_as_admin();
		$this->register_revision_snapshots();
	}

	public function test_snapshot_post_id__targets_the_written_document() {
		// Arrange
		$input = [ 'post_id' => self::POST_ID ];

		// Act
		$manage_elements_target = ( new Manage_Elements_Ability() )->get_snapshot_post_id( $input );
		$build_composition_target = ( new Build_Composition_Ability() )->get_snapshot_post_id( $input );
		$update_settings_target = ( new Update_Settings_Ability() )->get_snapshot_post_id( $input );

		// Assert
		$this->assertSame( self::POST_ID, $manage_elements_target );
		$this->assertSame( self::POST_ID, $build_composition_target );
		$this->assertSame( self::POST_ID, $update_settings_target );
	}

	public function test_snapshot_post_id__skips_build_composition_dry_runs() {
		// Act
		$target = ( new Build_Composition_Ability() )->get_snapshot_post_id( [
			'post_id' => self::POST_ID,
			'dry_run' => true,
		] );

		// Assert
		$this->assertSame( 0, $target );
	}

	public function test_snapshot_post_id__targets_components_only_on_update() {
		// Arrange
		$ability = new Manage_Component_Ability();

		// Act
		$update_target = $ability->get_snapshot_post_id( [
			'action' => Manage_Component_Ability::ACTION_UPDATE,
			'component_id' => self::POST_ID,
		] );
		$rename_target = $ability->get_snapshot_post_id( [
			'action' => Manage_Component_Ability::ACTION_RENAME,
			'component_id' => self::POST_ID,
		] );

		// Assert
		$this->assertSame( self::POST_ID, $update_target );
		$this->assertSame( 0, $rename_target );
	}

	public function test_update_page_settings__can_be_undone() {
		// Arrange
		$post_id = $this->create_elementor_page( 'draft', $this->containers( 1 ) );
		$update = ( new Update_Settings_Ability() )->execute_guarded( [
			'post_id' => $post_id,
			'settings' => [ 'hide_title' => 'yes' ],
		] );

		// Act
		( new Manage_Revisions_Ability() )->execute_guarded( [
			'action' => Manage_Revisions_Ability::ACTION_RESTORE,
			'post_id' => $post_id,
			'revision_id' => $update['undo_revision_id'],
		] );

		// Assert
		$this->assertIsInt( $update['undo_revision_id'] );
		$this->assertEmpty( get_post_meta( $post_id, Page_Settings_Manager::META_KEY, true ) );
	}
}
