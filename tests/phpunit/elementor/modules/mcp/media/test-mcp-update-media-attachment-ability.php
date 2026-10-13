<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp\Media;

use Elementor\Modules\Mcp\Abilities\Update_Media_Attachment_Ability;
use Elementor\Modules\Mcp\Media\Mcp_Media_Feature_Gate;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Mcp_Update_Media_Attachment_Ability extends Elementor_Test_Base {

	public function tearDown(): void {
		remove_all_filters( Mcp_Media_Feature_Gate::ENABLED_FILTER );
		parent::tearDown();
	}

	public function test_update_media_attachment__not_registered_when_feature_disabled() {
		// Arrange
		$registry = \Elementor\Modules\Mcp\Module::build_core_registry();

		// Assert
		$this->assertNull( $registry->find_by_proxy_slug( 'update-media-attachment' ) );
	}

	public function test_update_media_attachment__is_not_direct_mcp_tool_when_enabled() {
		// Arrange
		add_filter( Mcp_Media_Feature_Gate::ENABLED_FILTER, '__return_true' );
		$ability = new Update_Media_Attachment_Ability();

		// Assert
		$this->assertFalse( $ability->is_exposed_via_proxy() );
		$this->assertFalse( $ability->is_exposed_on_server() );
	}

	public function test_update_media_attachment__execute_updates_title_when_enabled() {
		// Arrange
		add_filter( Mcp_Media_Feature_Gate::ENABLED_FILTER, '__return_true' );
		$this->act_as_admin();
		$attachment_id = self::factory()->attachment->create( [
			'post_author' => get_current_user_id(),
			'post_mime_type' => 'image/jpeg',
			'post_title' => 'Before',
		] );
		$ability = new Update_Media_Attachment_Ability();

		// Act
		$result = $ability->execute( [
			'attachment_id' => $attachment_id,
			'title' => 'After',
		] );

		// Assert
		$this->assertIsArray( $result );
		$this->assertSame( 'After', get_post( $attachment_id )->post_title );
	}

	public function test_update_media_attachment__rejects_when_feature_disabled() {
		// Arrange
		$this->act_as_admin();
		$attachment_id = self::factory()->attachment->create( [
			'post_author' => get_current_user_id(),
			'post_mime_type' => 'image/jpeg',
		] );
		$ability = new Update_Media_Attachment_Ability();

		// Act
		$result = $ability->execute( [
			'attachment_id' => $attachment_id,
			'title' => 'After',
		] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'mcp_media_disabled', $result->get_error_code() );
	}
}
