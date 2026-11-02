<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Agents;

use Elementor\Core\Utils\Exceptions;
use Elementor\Modules\Agents\Agent_Ready_Settings;
use Elementor\Modules\Agents\Classes\Markdown_Content_Ajax;
use Elementor\Modules\Agents\Classes\Markdown_Revert_Ajax;
use Elementor\Modules\Agents\Components\Readability\Markdown_Endpoint;
use Elementor\Modules\Agents\Content_Generator;
use Elementor\Modules\Agents\Markdown_Manual_Content;
use Elementor\Modules\Agents\Prompt_Injection_Sanitizer;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Markdown_Manual_Content extends Elementor_Test_Base {

	private Agent_Ready_Settings $settings;

	private Markdown_Manual_Content $manual_content;

	private Markdown_Content_Ajax $save_ajax;

	private Markdown_Revert_Ajax $revert_ajax;

	public function setUp(): void {
		parent::setUp();

		$this->act_as_admin();

		delete_option( Agent_Ready_Settings::OPTION );

		$generator            = new Content_Generator( new Prompt_Injection_Sanitizer() );
		$this->settings       = new Agent_Ready_Settings( $generator );
		$this->manual_content = new Markdown_Manual_Content( $generator );
		$endpoint             = new Markdown_Endpoint( $this->settings, $this->manual_content );
		$this->save_ajax      = new Markdown_Content_Ajax( $endpoint, $this->manual_content );
		$this->revert_ajax    = new Markdown_Revert_Ajax( $this->manual_content );

		$this->settings->ensure_option_exists();
		$this->settings->activate();
	}

	public function tearDown(): void {
		delete_option( Agent_Ready_Settings::OPTION );

		parent::tearDown();
	}

	public function test_save__stores_sanitized_content_on_the_post() {
		// Arrange
		$post_id = $this->create_published_page();

		// Act
		$this->manual_content->save( $post_id, "# My page\n<script>alert(1)</script>Hello" );

		// Assert
		$this->assertTrue( $this->manual_content->has_override( $post_id ) );
		$this->assertStringContainsString( '# My page', $this->manual_content->get_content( $post_id ) );
		$this->assertStringNotContainsString( '<script>', $this->manual_content->get_content( $post_id ) );
	}

	public function test_save__rejects_empty_content() {
		// Arrange
		$post_id = $this->create_published_page();

		// Assert
		$this->expectException( \InvalidArgumentException::class );

		// Act
		$this->manual_content->save( $post_id, "  \n " );
	}

	public function test_save__rejects_content_over_the_size_cap() {
		// Arrange
		$post_id = $this->create_published_page();

		// Assert
		$this->expectException( \InvalidArgumentException::class );

		// Act
		$this->manual_content->save( $post_id, str_repeat( 'a', Content_Generator::LLMS_FULL_HARD_CAP + 1 ) );
	}

	public function test_override__is_removed_when_the_post_is_deleted() {
		// Arrange
		$post_id = $this->create_published_page();
		$this->manual_content->save( $post_id, '# Hand written' );

		// Act
		wp_delete_post( $post_id, true );

		// Assert
		$this->assertFalse( metadata_exists( 'post', $post_id, Markdown_Manual_Content::META_KEY ) );
	}

	public function test_override__survives_a_slug_change() {
		// Arrange
		$post_id = $this->create_published_page();
		$this->manual_content->save( $post_id, '# Hand written' );

		// Act
		wp_update_post( [
			'ID'        => $post_id,
			'post_name' => 'renamed-slug',
		] );

		// Assert
		$this->assertSame( '# Hand written', $this->manual_content->get_content( $post_id ) );
	}

	public function test_save_ajax_handle__saves_override_for_the_post() {
		// Arrange
		$post_id = $this->create_published_page();

		// Act
		$result = $this->save_ajax->handle( [
			'postId'  => $post_id,
			'content' => '# Edited by hand',
		] );

		// Assert
		$this->assertSame( [ 'isOverridden' => true ], $result );
		$this->assertSame( '# Edited by hand', $this->manual_content->get_content( $post_id ) );
	}

	public function test_save_ajax_handle__rejects_users_without_manage_options() {
		// Arrange
		$post_id = $this->create_published_page();
		$this->act_as_editor();

		// Act
		try {
			$this->save_ajax->handle( [
				'postId'  => $post_id,
				'content' => '# Not allowed',
			] );
			$this->fail( 'Expected the save to be refused for non-admins.' );
		} catch ( \Exception $exception ) {
			// Assert
			$this->assertSame( Exceptions::FORBIDDEN, $exception->getCode() );
			$this->assertFalse( $this->manual_content->has_override( $post_id ) );
		}
	}

	public function test_save_ajax_handle__rejects_a_post_type_that_is_not_included() {
		// Arrange
		$this->settings->set_server_value( Agent_Ready_Settings::MODULE_MARKDOWN_CONTENT, 'post_types', [ 'page' ] );
		$post_id = $this->factory()->post->create( [
			'post_type'   => 'post',
			'post_status' => 'publish',
		] );

		// Act
		try {
			$this->save_ajax->handle( [
				'postId'  => $post_id,
				'content' => '# Excluded',
			] );
			$this->fail( 'Expected the save to be refused for an excluded post type.' );
		} catch ( \Exception $exception ) {
			// Assert
			$this->assertSame( Exceptions::BAD_REQUEST, $exception->getCode() );
			$this->assertFalse( $this->manual_content->has_override( $post_id ) );
		}
	}

	public function test_revert_ajax_handle__discards_the_override() {
		// Arrange
		$post_id = $this->create_published_page();
		$this->manual_content->save( $post_id, '# Edited by hand' );

		// Act
		$result = $this->revert_ajax->handle( [ 'postId' => $post_id ] );

		// Assert
		$this->assertSame( [ 'isOverridden' => false ], $result );
		$this->assertFalse( $this->manual_content->has_override( $post_id ) );
	}

	public function test_revert_ajax_handle__rejects_users_without_manage_options() {
		// Arrange
		$post_id = $this->create_published_page();
		$this->manual_content->save( $post_id, '# Edited by hand' );
		$this->act_as_editor();

		// Act
		try {
			$this->revert_ajax->handle( [ 'postId' => $post_id ] );
			$this->fail( 'Expected the revert to be refused for non-admins.' );
		} catch ( \Exception $exception ) {
			// Assert
			$this->assertSame( Exceptions::FORBIDDEN, $exception->getCode() );
			$this->assertTrue( $this->manual_content->has_override( $post_id ) );
		}
	}

	private function create_published_page(): int {
		return $this->factory()->post->create( [
			'post_type'    => 'page',
			'post_status'  => 'publish',
			'post_title'   => 'Manual Markdown Page',
			'post_content' => 'Body of the page that is long enough to extract.',
		] );
	}
}
