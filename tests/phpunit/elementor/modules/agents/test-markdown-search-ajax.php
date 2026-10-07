<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Agents;

use Elementor\Core\Utils\Exceptions;
use Elementor\Modules\Agents\Agent_Ready_Settings;
use Elementor\Modules\Agents\Classes\Markdown_Content_Catalog;
use Elementor\Modules\Agents\Classes\Markdown_Search_Ajax;
use Elementor\Modules\Agents\Content_Generator;
use Elementor\Modules\Agents\Prompt_Injection_Sanitizer;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Markdown_Search_Ajax extends Elementor_Test_Base {

	private Agent_Ready_Settings $settings;

	private Markdown_Search_Ajax $ajax;

	public function setUp(): void {
		parent::setUp();

		$this->act_as_admin();

		delete_option( Agent_Ready_Settings::OPTION );

		$this->settings = new Agent_Ready_Settings( new Content_Generator( new Prompt_Injection_Sanitizer() ) );
		$this->settings->ensure_option_exists();
		$this->ajax = new Markdown_Search_Ajax( $this->settings, new Markdown_Content_Catalog() );
	}

	public function tearDown(): void {
		delete_option( Agent_Ready_Settings::OPTION );

		parent::tearDown();
	}

	public function test_handle__searches_only_the_saved_post_types() {
		// Arrange
		$this->settings->set_server_value( Agent_Ready_Settings::MODULE_MARKDOWN_CONTENT, 'post_types', [ 'page' ] );
		$page_id = $this->factory()->post->create( [
			'post_type'   => 'page',
			'post_status' => 'publish',
			'post_title'  => 'Landing Page',
		] );
		$post_id = $this->factory()->post->create( [
			'post_type'   => 'post',
			'post_status' => 'publish',
			'post_title'  => 'Landing Post',
		] );

		// Act
		$result = $this->ajax->handle( [ 'term' => 'Landing' ] );

		// Assert
		$ids = array_column( $result['items'], 'id' );
		$this->assertContains( $page_id, $ids );
		$this->assertNotContains( $post_id, $ids );
	}

	public function test_handle__returns_no_items_when_markdown_is_disabled() {
		// Arrange
		$this->settings->set_server_value( Agent_Ready_Settings::MODULE_MARKDOWN_CONTENT, 'enabled', false );
		$this->factory()->post->create( [
			'post_type'   => 'page',
			'post_status' => 'publish',
		] );

		// Act
		$result = $this->ajax->handle( [] );

		// Assert
		$this->assertSame( [ 'items' => [] ], $result );
	}

	public function test_handle__rejects_a_user_without_manage_options() {
		// Arrange
		wp_set_current_user( $this->factory()->user->create( [ 'role' => 'subscriber' ] ) );

		// Assert
		$this->expectException( \Exception::class );
		$this->expectExceptionCode( Exceptions::FORBIDDEN );

		// Act
		$this->ajax->handle( [ 'term' => 'anything' ] );
	}
}
