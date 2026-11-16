<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\AtomicWidgets\Utils;

use Elementor\Core\Base\Document;
use Elementor\Modules\AtomicWidgets\Utils\Custom_Attributes_Trust;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Custom_Attributes_Trust extends Elementor_Test_Base {

	public function test_record_last_editor__stores_the_user_who_saved_elementor_data() {
		// Arrange.
		$user = $this->act_as( 'editor' );
		$post_id = $this->factory()->post->create();

		// Act.
		update_post_meta( $post_id, Document::ELEMENTOR_DATA_META_KEY, '[]' );

		// Assert.
		$this->assertSame( (string) $user->ID, get_post_meta( $post_id, Custom_Attributes_Trust::LAST_EDITOR_META_KEY, true ) );
	}

	public function test_record_last_editor__updates_the_user_on_each_save() {
		// Arrange.
		$this->act_as_admin_or_network_admin();
		$post_id = $this->factory()->post->create();
		update_post_meta( $post_id, Document::ELEMENTOR_DATA_META_KEY, '[]' );
		$contributor = $this->act_as( 'contributor' );

		// Act.
		update_post_meta( $post_id, Document::ELEMENTOR_DATA_META_KEY, '[{"id":"1"}]' );

		// Assert.
		$this->assertSame( (string) $contributor->ID, get_post_meta( $post_id, Custom_Attributes_Trust::LAST_EDITOR_META_KEY, true ) );
		$this->assertFalse( Custom_Attributes_Trust::is_post_trusted( $post_id ) );
	}

	public function test_record_last_editor__ignores_other_meta_keys() {
		// Arrange.
		$this->act_as_admin_or_network_admin();
		$post_id = $this->factory()->post->create();

		// Act.
		update_post_meta( $post_id, '_elementor_page_settings', [] );

		// Assert.
		$this->assertSame( '', get_post_meta( $post_id, Custom_Attributes_Trust::LAST_EDITOR_META_KEY, true ) );
	}

	public function test_is_post_trusted__is_true_when_last_editor_has_unfiltered_html() {
		// Arrange.
		$this->act_as_admin_or_network_admin();
		$post_id = $this->factory()->post->create();
		update_post_meta( $post_id, Document::ELEMENTOR_DATA_META_KEY, '[]' );

		// Act.
		$result = Custom_Attributes_Trust::is_post_trusted( $post_id );

		// Assert.
		$this->assertTrue( $result );
	}

	public function test_record_last_editor__keeps_the_previous_editor_when_no_user_is_logged_in() {
		// Arrange.
		$user = $this->act_as_admin_or_network_admin();
		$post_id = $this->factory()->post->create();
		update_post_meta( $post_id, Document::ELEMENTOR_DATA_META_KEY, '[]' );
		wp_set_current_user( 0 );

		// Act.
		update_post_meta( $post_id, Document::ELEMENTOR_DATA_META_KEY, '[{"id":"1"}]' );

		// Assert.
		$this->assertSame( (string) $user->ID, get_post_meta( $post_id, Custom_Attributes_Trust::LAST_EDITOR_META_KEY, true ) );
	}

	public function test_record_last_editor__skips_posts_saved_without_a_logged_in_user() {
		// Arrange.
		wp_set_current_user( 0 );
		$post_id = $this->factory()->post->create();

		// Act.
		update_post_meta( $post_id, Document::ELEMENTOR_DATA_META_KEY, '[]' );

		// Assert.
		$this->assertFalse( metadata_exists( 'post', $post_id, Custom_Attributes_Trust::LAST_EDITOR_META_KEY ) );
	}

	public function test_is_post_trusted__is_true_when_no_editor_was_recorded() {
		// Arrange.
		$post_id = $this->factory()->post->create();

		// Act.
		$result = Custom_Attributes_Trust::is_post_trusted( $post_id );

		// Assert.
		$this->assertTrue( $result );
	}

	public function test_is_post_trusted__is_false_when_recorded_editor_no_longer_exists() {
		// Arrange.
		$post_id = $this->factory()->post->create();
		update_post_meta( $post_id, Custom_Attributes_Trust::LAST_EDITOR_META_KEY, PHP_INT_MAX );

		// Act.
		$result = Custom_Attributes_Trust::is_post_trusted( $post_id );

		// Assert.
		$this->assertFalse( $result );
	}
}
