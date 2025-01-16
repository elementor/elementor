<?php
namespace Elementor\Testing\Includes\TemplateLibrary;

use Elementor\Plugin;
use Elementor\TemplateLibrary\Manager;
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
		$new_source = new \Elementor\TemplateLibrary\Source_Local();

		$this->ensure_post_type_rest_routes();

		$this->assertEquals( self::$manager->get_registered_sources()['local'], $new_source );
	}

	public function test_should_return_source() {
		$new_source = new \Elementor\TemplateLibrary\Source_Local();

		$this->ensure_post_type_rest_routes();

		$this->assertEquals( self::$manager->get_source( 'local' ), $new_source );
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

	/**
	 *
	 */
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

	/**
	 * @covers \Elementor\TemplateLibrary\Manager::get_template_data()
	 */
	public function test_should_return_data_from_get_template_data() {
		$wordpress_adapter_mock = $this->getMockBuilder( Wordpress_Adapter_Interface::class )->getMock();
		$wordpress_adapter_mock->method( 'current_user_can' )->willReturn( true );
		self::$manager->set_wordpress_adapter( $wordpress_adapter_mock );

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
