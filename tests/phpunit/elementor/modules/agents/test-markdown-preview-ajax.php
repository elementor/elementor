<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Agents;

use Elementor\Core\Utils\Exceptions;
use Elementor\Modules\Agents\Agent_Ready_Settings;
use Elementor\Modules\Agents\Classes\Markdown_Preview_Ajax;
use Elementor\Modules\Agents\Components\Readability\Markdown_Endpoint;
use Elementor\Modules\Agents\Content_Generator;
use Elementor\Modules\Agents\Prompt_Injection_Sanitizer;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Markdown_Preview_Ajax extends Elementor_Test_Base {

	private Agent_Ready_Settings $settings;

	private Markdown_Endpoint $endpoint;

	private Markdown_Preview_Ajax $ajax;

	public function setUp(): void {
		parent::setUp();

		$this->act_as_admin();

		delete_option( Agent_Ready_Settings::OPTION );

		$this->settings = new Agent_Ready_Settings( new Content_Generator( new Prompt_Injection_Sanitizer() ) );
		$this->settings->ensure_option_exists();
		$this->endpoint = new Markdown_Endpoint( $this->settings );
		$this->ajax     = new Markdown_Preview_Ajax( $this->endpoint );
	}

	public function tearDown(): void {
		delete_option( Agent_Ready_Settings::OPTION );

		parent::tearDown();
	}

	public function test_handle__returns_the_same_markdown_as_the_public_builder() {
		// Arrange
		$post = get_post( $this->factory()->post->create( [
			'post_type'    => 'page',
			'post_status'  => 'publish',
			'post_title'   => 'Preview Page',
			'post_content' => 'Preview body is long enough to extract.',
		] ) );

		// Act
		$result = $this->ajax->handle( [ 'postId' => $post->ID ] );

		// Assert
		$this->assertSame( $this->endpoint->build_markdown( $post ), $result['content'] );
		$this->assertStringContainsString( 'Preview body is long enough to extract.', $result['content'] );
	}

	public function test_handle__rejects_a_post_type_that_is_not_included() {
		// Arrange
		$this->settings->set_server_value( Agent_Ready_Settings::MODULE_MARKDOWN_CONTENT, 'post_types', [ 'page' ] );
		$post_id = $this->factory()->post->create( [
			'post_type'   => 'post',
			'post_status' => 'publish',
			'post_title'  => 'Excluded Post',
		] );

		// Assert
		$this->expectException( \Exception::class );
		$this->expectExceptionCode( Exceptions::BAD_REQUEST );
		$this->expectExceptionMessage( 'This content type is not included.' );

		// Act
		$this->ajax->handle( [ 'postId' => $post_id ] );
	}

	public function test_handle__rejects_a_user_without_manage_options() {
		// Arrange
		wp_set_current_user( $this->factory()->user->create( [ 'role' => 'subscriber' ] ) );
		$post_id = $this->factory()->post->create( [
			'post_type'   => 'page',
			'post_status' => 'publish',
		] );

		// Assert
		$this->expectException( \Exception::class );
		$this->expectExceptionCode( Exceptions::FORBIDDEN );

		// Act
		$this->ajax->handle( [ 'postId' => $post_id ] );
	}
}
