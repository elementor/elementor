<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Agents;

use Elementor\Core\Utils\Exceptions;
use Elementor\Modules\Agents\Agent_Ready_Settings;
use Elementor\Modules\Agents\Classes\Content_Items_Ajax;
use Elementor\Modules\Agents\Classes\Markdown_Content_Catalog;
use Elementor\Modules\Agents\Content_Generator;
use Elementor\Modules\Agents\Markdown_Manual_Content;
use Elementor\Modules\Agents\Prompt_Injection_Sanitizer;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Content_Items_Ajax extends Elementor_Test_Base {

	private Agent_Ready_Settings $settings;

	private Content_Items_Ajax $ajax;

	public function setUp(): void {
		parent::setUp();

		$this->act_as_admin();

		delete_option( Agent_Ready_Settings::OPTION );

		$generator      = new Content_Generator( new Prompt_Injection_Sanitizer() );
		$this->settings = new Agent_Ready_Settings( $generator );
		$this->settings->ensure_option_exists();
		$this->settings->activate();
		$this->ajax = new Content_Items_Ajax( $this->settings, new Markdown_Content_Catalog( new Markdown_Manual_Content( $generator ) ) );
	}

	public function tearDown(): void {
		delete_option( Agent_Ready_Settings::OPTION );

		parent::tearDown();
	}

	public function test_handle__pages_through_every_post_of_the_type_including_excluded_ones() {
		// Arrange
		$total = Markdown_Content_Catalog::PAGE_SIZE + 1;
		$ids   = $this->factory()->post->create_many( $total, [ 'post_type' => 'page', 'post_status' => 'publish' ] );
		$this->factory()->post->create( [ 'post_type' => 'post', 'post_status' => 'publish' ] );
		$this->settings->set_server_value( Agent_Ready_Settings::MODULE_LLMS_TXT, 'excluded_post_ids', [ $ids[0] ] );

		// Act
		$first_page  = $this->ajax->handle( [ 'module' => Agent_Ready_Settings::MODULE_LLMS_TXT, 'postType' => 'page', 'page' => 1 ] );
		$second_page = $this->ajax->handle( [ 'module' => Agent_Ready_Settings::MODULE_LLMS_TXT, 'postType' => 'page', 'page' => 2 ] );

		// Assert
		$listed_ids = array_merge( array_column( $first_page['items'], 'id' ), array_column( $second_page['items'], 'id' ) );

		$this->assertTrue( $first_page['hasMore'] );
		$this->assertFalse( $second_page['hasMore'] );
		$this->assertEqualsCanonicalizing( $ids, $listed_ids );
		$this->assertSame( [ 'id', 'title', 'url' ], array_keys( $first_page['items'][0] ) );
	}

	public function test_handle__lists_excluded_posts_first_on_the_first_page_only() {
		// Arrange
		$ids = $this->factory()->post->create_many( Markdown_Content_Catalog::PAGE_SIZE + 1, [ 'post_type' => 'page', 'post_status' => 'publish' ] );
		$last_id = end( $ids );
		$this->settings->set_server_value( Agent_Ready_Settings::MODULE_LLMS_TXT, 'excluded_post_ids', [ $last_id ] );

		// Act
		$first_page  = $this->ajax->handle( [ 'module' => Agent_Ready_Settings::MODULE_LLMS_TXT, 'postType' => 'page', 'page' => 1 ] );
		$second_page = $this->ajax->handle( [ 'module' => Agent_Ready_Settings::MODULE_LLMS_TXT, 'postType' => 'page', 'page' => 2 ] );

		// Assert
		$this->assertSame( $last_id, $first_page['items'][0]['id'] );
		$this->assertNotContains( $last_id, array_column( $second_page['items'], 'id' ) );
	}

	public function test_handle__filters_by_title() {
		// Arrange
		$match_id = $this->factory()->post->create( [ 'post_type' => 'page', 'post_status' => 'publish', 'post_title' => 'Pricing' ] );
		$this->factory()->post->create( [ 'post_type' => 'page', 'post_status' => 'publish', 'post_title' => 'About' ] );

		// Act
		$result = $this->ajax->handle( [ 'module' => Agent_Ready_Settings::MODULE_MARKDOWN_CONTENT, 'postType' => 'page', 'term' => 'Pricing' ] );

		// Assert
		$this->assertSame( [ $match_id ], array_column( $result['items'], 'id' ) );
	}

	public function test_handle__returns_no_items_for_a_post_type_the_module_leaves_out() {
		// Arrange
		$this->factory()->post->create( [ 'post_type' => 'page', 'post_status' => 'publish' ] );
		$this->settings->set_server_value( Agent_Ready_Settings::MODULE_LLMS_TXT, 'post_types', [ 'post' ] );

		// Act
		$result = $this->ajax->handle( [ 'module' => Agent_Ready_Settings::MODULE_LLMS_TXT, 'postType' => 'page' ] );

		// Assert
		$this->assertSame( [ 'items' => [], 'hasMore' => false ], $result );
	}

	public function test_handle__rejects_an_unknown_module() {
		// Assert
		$this->expectException( \Exception::class );
		$this->expectExceptionCode( Exceptions::BAD_REQUEST );

		// Act
		$this->ajax->handle( [ 'module' => 'bot_access_control', 'postType' => 'page' ] );
	}

	public function test_handle__rejects_a_user_without_manage_options() {
		// Arrange
		wp_set_current_user( $this->factory()->user->create( [ 'role' => 'subscriber' ] ) );

		// Assert
		$this->expectException( \Exception::class );
		$this->expectExceptionCode( Exceptions::FORBIDDEN );

		// Act
		$this->ajax->handle( [ 'module' => Agent_Ready_Settings::MODULE_LLMS_TXT, 'postType' => 'page' ] );
	}
}
