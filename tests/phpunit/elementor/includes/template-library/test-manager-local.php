<?php
namespace Elementor\Testing\Includes\TemplateLibrary;

use Elementor\Plugin;
use Elementor\Core\Base\Document;
use Elementor\TemplateLibrary\Manager;
use Elementor\TemplateLibrary\Source_Local;
use ElementorEditorTesting\Elementor_Test_Base;
use Elementor\Core\Isolation\Wordpress_Adapter_Interface;

class Elementor_Test_Manager_Local extends Elementor_Test_Base {

	/**
	 * @var Manager
	 */
	protected static $manager;
	private $fake_post_id = '123';

	public static function setUpBeforeClass(): void {
		self::$manager = self::elementor()->templates_manager;
	}

	public function setUp(): void {
		parent::setUp();
		wp_set_current_user( $this->factory()->get_administrator_user()->ID );
	}

	public function test_should_return_registered_sources() {
		$this->ensure_post_type_rest_routes();

		$sources = self::$manager->get_registered_sources();
		
		$this->assertArrayHasKey( 'local', $sources );
		$this->assertInstanceOf( \Elementor\TemplateLibrary\Source_Local::class, $sources['local'] );
	}

	public function test_should_return_source() {
		$this->ensure_post_type_rest_routes();

		$source = self::$manager->get_source( 'local' );
		
		$this->assertInstanceOf( \Elementor\TemplateLibrary\Source_Local::class, $source );
	}

	public function test_should_return_wp_error_save_error_from_save_template() {
		wp_set_current_user( $this->factory()->get_subscriber_user()->ID );
		$this->assertWPError(
			self::$manager->save_template(
				[
					'post_id' => $this->fake_post_id,
					'source' => 'local',
					'content' => 'content',
					'type' => 'comment',
				]
			), 'save_error'
		);
	}

	public function test_should_return_template_data_from_save_template() {
		wp_set_current_user( $this->factory()->create_and_get_administrator_user()->ID );
		$template_data = [
			'post_id' => $this->factory()->get_default_post()->ID,
			'source' => 'local',
			'content' => 'content',
			'type' => 'page',
		];

		$remote_remote = [
			'template_id',
			'source',
			'type',
			'title',
			'thumbnail',
			'hasPageSettings',
			'tags',
			'url',
		];
		$saved_template = self::$manager->save_template( $template_data );

		$this->assert_array_have_keys( $remote_remote, $saved_template );
	}


	public function test_should_return_wp_error_arguments_not_specified_from_update_template() {
		$this->assertWPError( self::$manager->update_template( [ 'post_id' => $this->fake_post_id ] ), 'arguments_not_specified' );
	}


	public function test_should_return_wp_error_template_error_from_update_template() {
		$this->assertWPError(
			self::$manager->update_template(
				[
					'source' => 'content',
					'content' => 'content',
					'type' => 'page',
				]
			), 'template_error'
		);
	}

	public function test_should_return_wp_error_save_error_from_update_template() {
		wp_set_current_user( $this->factory()->get_subscriber_user()->ID );
		$this->assertWPError(
			self::$manager->update_template(
				[
					'source' => 'local',
					'content' => 'content',
					'type' => 'comment',
					'id' => $this->fake_post_id,
				]
			), 'save_error'
		);
	}

	public function test_should_return_template_data_from_update_template() {
		wp_set_current_user( $this->factory()->create_and_get_administrator_user()->ID );
		$post_id = $this->factory()->create_and_get_default_post()->ID;
		$template_data = [
			'source' => 'local',
			'content' => 'content',
			'type' => 'post',
			'id' => $post_id,
		];

		$remote_remote = [
			'template_id',
			'source',
			'type',
			'title',
			'thumbnail',
			'author',
			'hasPageSettings',
			'tags',
			'url',
		];
		$updated_template = self::$manager->update_template( $template_data );

		$this->assert_array_have_keys( $remote_remote, $updated_template );
	}

	public function test_rename_template_should_return_updated_template() {
		$template_data = [
			'id' => $this->factory()->get_default_post()->ID,
			'source' => 'local',
			'title' => 'Updated Title',
		];

		$updated_template = self::$manager->rename_template( $template_data );

		$this->assertEquals( $updated_template['title'], $template_data['title'] );
	}

	/**
	 * @covers \Elementor\TemplateLibrary\Manager::get_template_data()
	 */
	public function test_should_return_data_from_get_template_data() {
		$wordpress_adapter_mock = $this->getMockBuilder( Wordpress_Adapter_Interface::class )->getMock();
		$wordpress_adapter_mock->method( 'current_user_can' )->willReturn( true );
		self::$manager->get_source( 'local' )->set_wordpress_adapter( $wordpress_adapter_mock );

		$ret = self::$manager->get_template_data(
			[
				'source' => 'local',
				'template_id' => $this->fake_post_id,
			]
		);

		$this->assertEquals( $ret, [ 'content' => [] ] );
	}

	public function test_get_data__document_without_data() {
		// Arrange
		$is_edit_mode = Plugin::$instance->editor->is_edit_mode();

		Plugin::$instance->editor->set_edit_mode( false );

		$post = $this->factory()->create_and_get_custom_post( [
			'meta_input' => [
				'_elementor_data' => [],
			],
		] );

		// Act
		$result = Plugin::$instance->templates_manager->get_source( 'local' )->get_data( [
			'template_id' => $post->ID,
		] );

		// Assert
		$this->assertArrayHasKey( 'content', $result );
		$this->assertTrue( is_array( $result['content'] ) );
		$this->assertEmpty( $result['content'] );

		Plugin::$instance->editor->set_edit_mode( $is_edit_mode );
	}

	public function test_get_data() {
		// Arrange
		$post = $this->factory()->create_and_get_custom_post( [
			'meta_input' => [
				'_elementor_data' => [
					[
						'id' => 'test',
						'elType' => 'section',
					],
				],
			],
		] );

		// Act
		$result = Plugin::$instance->templates_manager->get_source( 'local' )->get_data( [
			'template_id' => $post->ID,
		] );

		// Assert
		$this->assertArrayHasKey( 'content', $result );
		$this->assert_array_have_keys( [ 'id', 'elType' ], $result['content'][0] );
		$this->assert_array_not_have_keys(
			[ 'settings', 'elements', 'isInner' ],
			$result['content'][0],
			'should NOT have those keys if display is not exists in the args'
		);
		$this->assertEquals( 'section', $result['content'][0]['elType'] );
		$this->assertNotEquals( 'test', $result['content'][0]['id'], 'The id should be regenerate in get_data method' );

		// Act
		$result = Plugin::$instance->templates_manager->get_source( 'local' )->get_data( [
			'template_id' => $post->ID,
			'display' => true,
		] );

		// Assert
		$this->assertArrayHasKey( 'content', $result );
		$this->assert_array_have_keys( [ 'id', 'elType' ], $result['content'][0] );
		$this->assert_array_have_keys(
			[ 'settings', 'elements', 'isInner' ],
			$result['content'][0],
			'SHOULD have those keys if display is exists in the args'
		);
		$this->assertEquals( 'section', $result['content'][0]['elType'] );
		$this->assertNotEquals( 'test', $result['content'][0]['id'], 'The id should be regenerate in get_data method' );
	}

	public function test_cpt_rest_is_not_accessible_for_editor() {
		// Arrange
		do_action( 'rest_api_init');
		wp_set_current_user( $this->factory()->get_editor_user()->ID );
		$request = new \WP_REST_Request( 'GET', '/wp/v2/elementor_library' );

		// Act
		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 403, $response->get_status() );
		$this->assertEquals( 'rest_forbidden', $response->get_data()['code'] );
	}

	public function test_cpt_rest_is_accessible_for_admin() {
		// Arrange
		do_action( 'rest_api_init');
		wp_set_current_user( $this->factory()->get_administrator_user()->ID );
		$request = new \WP_REST_Request( 'GET', '/wp/v2/elementor_library' );

		// Act
		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 200, $response->get_status() );
		$this->assertIsArray( $response->get_data() );
	}

	public function test_admin_can_save_template_via_wp_rest() {
		// Arrange
		do_action( 'rest_api_init' );
		wp_set_current_user( $this->factory()->get_administrator_user()->ID );

		$template_data = [
			'title' => 'Test Template',
			'status' => 'publish',
			'meta' => [
				'_elementor_template_type' => 'container',
				'_elementor_edit_mode' => 'builder',
				'_elementor_data' => wp_json_encode([
					[
						'id' => 'test-section',
						'elType' => 'section',
						'settings' => [],
						'elements' => [],
						'isInner' => false
					]
				])
			]
		];

		$request = new \WP_REST_Request( 'POST', '/wp/v2/elementor_library' );
		$request->set_body_params( $template_data );

		// Act
		$response = rest_do_request( $request );
		$result = $response->get_data();

		// Assert
		$this->assertEquals( 201, $response->get_status() );
		$this->assertArrayHasKey( 'id', $result );
		$this->assertEquals( 'Test Template', $result['title']['rendered'] );
		$this->assertEquals( 'container', get_post_meta( $result['id'], '_elementor_template_type', true ) );
		$this->assertNotEmpty( get_post_meta( $result['id'], '_elementor_data', true ) );
	}

	public function test_load_more_templates__contributor_gets_only_readable_library_items() {
		// Arrange
		$posts = $this->create_items_for_query_tests();
		wp_set_current_user( $posts['contributor_id'] );

		// Act
		$result = self::$manager->load_more_templates( [
			'source' => 'local',
			'offset' => 0,
			'post_type' => [ 'post', 'page', Source_Local::CPT ],
			'post_status' => 'any',
			'author' => $posts['admin_id'],
			'meta_query' => [],
		] );

		// Assert
		$ids = wp_list_pluck( $result, 'template_id' );

		$this->assert_only_library_posts( $ids );
		$this->assertContains( $posts['admin_publish'], $ids );
		$this->assertNotContains( $posts['admin_draft'], $ids );
		$this->assertNotContains( $posts['admin_private'], $ids );
		$this->assertNotContains( $posts['admin_post_draft'], $ids );
	}

	public function test_get_folders__contributor_gets_only_readable_library_items() {
		// Arrange
		$posts = $this->create_items_for_query_tests();
		wp_set_current_user( $posts['contributor_id'] );

		// Act
		$result = self::$manager->get_folders( [
			'source' => 'local',
			'offset' => 0,
			'post_type' => 'post',
			'post_status' => [ 'draft', 'private', 'publish' ],
			'meta_query' => [],
		] );

		// Assert
		$ids = wp_list_pluck( $result, 'template_id' );

		$this->assert_only_library_posts( $ids );
		$this->assertNotContains( $posts['admin_draft'], $ids );
		$this->assertNotContains( $posts['admin_private'], $ids );
		$this->assertNotContains( $posts['admin_post_draft'], $ids );
	}

	public function test_get_items_query_args__drops_unknown_keys_and_normalizes_values() {
		// Arrange
		$method = new \ReflectionMethod( Manager::class, 'get_items_query_args' );
		$method->setAccessible( true );

		// Act
		$result = $method->invoke( self::$manager, [
			'source' => 'local',
			'offset' => '12',
			'limit' => '-5',
			'search' => '<b>Hero</b> section',
			'parentId' => '34',
			'orderby' => 'title',
			'order' => 'desc',
			'post_type' => 'post',
			'post_status' => 'any',
			'author' => 1,
			'meta_query' => [],
			'type' => 'page',
			'templateType' => 'folder',
		] );

		// Assert
		$this->assertSame( [
			'source' => 'local',
			'offset' => 12,
			'limit' => 5,
			'search' => 'Hero section',
			'parentId' => 34,
			'orderby' => 'title',
			'order' => 'DESC',
		], $result );
	}

	public function test_get_items_query_args__normalizes_order_and_drops_invalid_values() {
		// Arrange
		$method = new \ReflectionMethod( Manager::class, 'get_items_query_args' );
		$method->setAccessible( true );

		// Act
		$asc = $method->invoke( self::$manager, [ 'source' => 'local', 'offset' => 0, 'order' => 'asc' ] );
		$unknown = $method->invoke( self::$manager, [ 'source' => 'local', 'offset' => 0, 'order' => 'RAND()' ] );
		$invalid = $method->invoke( self::$manager, [
			'source' => 'local',
			'offset' => [ 1 ],
			'order' => '',
			'orderby' => [ 'title' => 'ASC' ],
			'parentId' => '',
			'search' => [ 'a' ],
		] );

		// Assert
		$this->assertSame( 'ASC', $asc['order'] );
		$this->assertSame( 'DESC', $unknown['order'] );
		$this->assertSame( 0, $invalid['offset'] );
		$this->assertSame( '', $invalid['search'] );
		$this->assertArrayNotHasKey( 'order', $invalid );
		$this->assertArrayNotHasKey( 'orderby', $invalid );
		$this->assertArrayNotHasKey( 'parentId', $invalid );
	}

	public function test_local_get_items__skips_unreadable_posts_for_contributor_only() {
		// Arrange
		$posts = $this->create_items_for_query_tests();
		$source = self::$manager->get_source( 'local' );
		$args = [
			'post_status' => [ 'draft', 'private', 'publish' ],
			'post_type' => 'post',
		];

		// Act
		wp_set_current_user( $posts['contributor_id'] );
		$contributor_ids = wp_list_pluck( $source->get_items( $args ), 'template_id' );

		wp_set_current_user( $posts['admin_id'] );
		$admin_ids = wp_list_pluck( $source->get_items( $args ), 'template_id' );

		// Assert
		$this->assert_only_library_posts( $contributor_ids );
		$this->assertContains( $posts['admin_publish'], $contributor_ids );
		$this->assertContains( $posts['contributor_draft'], $contributor_ids );
		$this->assertNotContains( $posts['admin_draft'], $contributor_ids );
		$this->assertNotContains( $posts['admin_private'], $contributor_ids );

		$this->assert_only_library_posts( $admin_ids );
		$this->assertContains( $posts['admin_publish'], $admin_ids );
		$this->assertContains( $posts['admin_draft'], $admin_ids );
		$this->assertContains( $posts['admin_private'], $admin_ids );
		$this->assertContains( $posts['contributor_draft'], $admin_ids );
		$this->assertNotContains( $posts['admin_post_draft'], $admin_ids );
	}

	public function test_load_more_templates__admin_default_args_are_unchanged() {
		// Arrange
		$posts = $this->create_items_for_query_tests();
		wp_set_current_user( $posts['admin_id'] );

		// Act
		$result = self::$manager->load_more_templates( [
			'source' => 'local',
			'offset' => 0,
			'search' => '',
			'orderby' => 'title',
			'order' => 'asc',
		] );

		// Assert
		$ids = wp_list_pluck( $result, 'template_id' );

		$this->assert_only_library_posts( $ids );
		$this->assertContains( $posts['admin_publish'], $ids );
		$this->assertContains( $posts['admin_publish_second'], $ids );
		$this->assertNotContains( $posts['admin_draft'], $ids );
		$this->assertNotContains( $posts['admin_private'], $ids );

		$this->assertLessThan(
			array_search( $posts['admin_publish'], $ids, true ),
			array_search( $posts['admin_publish_second'], $ids, true )
		);
	}

	public function test_local_get_items__admin_direct_type_filter_still_works() {
		// Arrange
		$posts = $this->create_items_for_query_tests();
		wp_set_current_user( $posts['admin_id'] );

		// Act
		$ids = wp_list_pluck(
			self::$manager->get_source( 'local' )->get_items( [ 'type' => 'page' ] ),
			'template_id'
		);

		// Assert
		$this->assertContains( $posts['admin_publish'], $ids );
		$this->assertContains( $posts['admin_publish_second'], $ids );
	}

	private function create_items_for_query_tests(): array {
		$admin_id = $this->factory()->user->create( [ 'role' => 'administrator' ] );
		$contributor_id = $this->factory()->user->create( [ 'role' => 'contributor' ] );

		return [
			'admin_id' => $admin_id,
			'contributor_id' => $contributor_id,
			'admin_publish' => $this->create_library_post( $admin_id, 'publish', 'B Published template' ),
			'admin_publish_second' => $this->create_library_post( $admin_id, 'publish', 'A Published template' ),
			'admin_draft' => $this->create_library_post( $admin_id, 'draft', 'Admin draft template' ),
			'admin_private' => $this->create_library_post( $admin_id, 'private', 'Admin private template' ),
			'contributor_draft' => $this->create_library_post( $contributor_id, 'draft', 'Contributor draft template' ),
			'admin_post_draft' => $this->create_library_post( $admin_id, 'draft', 'Admin draft post', 'post' ),
		];
	}

	private function create_library_post( int $author_id, string $status, string $title, string $post_type = Source_Local::CPT ): int {
		return $this->factory()->post->create( [
			'post_type' => $post_type,
			'post_status' => $status,
			'post_author' => $author_id,
			'post_title' => $title,
			'meta_input' => [
				Document::TYPE_META_KEY => 'page',
			],
		] );
	}

	private function assert_only_library_posts( array $ids ) {
		foreach ( $ids as $id ) {
			$this->assertSame( Source_Local::CPT, get_post_type( $id ) );
		}
	}

	/**
	 * The data managers are killing the rest server (@see `kill_server`), and removing the post type rest routes.
	 * This is a workaround to re-register the post type rest routes.
	 * @return void
	 */
	private function ensure_post_type_rest_routes() {
		global $wp_rest_server;
		$wp_rest_server = null;
		rest_get_server();
	}
}
