<?php

namespace Elementor\Testing\Modules\SiteNavigation\Data\Recent;

use Elementor\Core\Base\Document;
use Elementor\Core\Kits\Documents\Kit;
use Elementor\Modules\LandingPages\Documents\Landing_Page;
use Elementor\Modules\SiteNavigation\Module;
use Elementor\Plugin;
use Elementor\TemplateLibrary\Source_Local;
use ElementorEditorTesting\Elementor_Test_Base;
use Elementor\Core\Experiments\Manager as Experiments_Manager;

class Test_Controller extends Elementor_Test_Base {

	/**
	 * @var Module
	 */
	protected $module;

	const RECENTLY_EDITED_ENDPOINT = '/site-navigation/recent-posts';
	const ADD_NEW_POST_ENDPOINT = '/site-navigation/add-new-post';
	const DUPLICATE_POST_ENDPOINT = '/site-navigation/duplicate-post';

	private $original_experiment_default_state;

	public function setUp() {
		parent::setUp();

		$this->module = new Module();

		$this->original_experiment_default_state = Plugin::$instance->experiments
			->get_features( $this->module::PAGES_PANEL_EXPERIMENT_NAME )['default'];

		Plugin::$instance->experiments->set_feature_default_state(
			$this->module::PAGES_PANEL_EXPERIMENT_NAME,
			Experiments_Manager::STATE_ACTIVE
		);

	}

	public function tearDown() {
		parent::tearDown();

		Plugin::$instance->experiments->set_feature_default_state(
			$this->module::PAGES_PANEL_EXPERIMENT_NAME,
			$this->original_experiment_default_state
		);
	}

	/**
	 * Test access denied
	 */
	public function test_get_items__forbidden() {
		// Arrange.
		$this->act_as_subscriber();

		// Act.
		$response = $this->send_request( 'GET', self::RECENTLY_EDITED_ENDPOINT, [
			'posts_per_page' => 10,
		] );

		// Assert.
		$this->assertEquals( 403, $response->get_status() );
	}

	/**
	 * @dataProvider get_items_provider
	 * @return void
	 */
	public function test_get_items__invalid_args( $posts_per_page, $post_type, $post__not_in ) {
		// Arrange.
		$this->act_as_editor();

		// Act.
		$params = [
			'posts_per_page' => $posts_per_page,
			'post_type' => $post_type,
			'post__not_in' => $post__not_in,
		];

		$response = $this->send_request( 'GET', self::RECENTLY_EDITED_ENDPOINT, $params );

		// Assert.
		$this->assertEquals( 400, $response->get_status() );
	}

	public function get_items_provider() {
		return [
			'no params' => [
				'posts_per_page' => '',
				'post_type' => '',
				'post__not_in' => '',
			],
			'invalid posts_per_page' => [
				'posts_per_page' => 'invalid',
				'post_type' => '',
				'post__not_in' => '',
			],
		];
	}

	public function test_get_items() {
		// Arrange.
		$this->act_as_editor();

		$older_time = time() - 20;

		// Mock ten posts.
		$posts = [];
		for ( $i = 0; $i < 10; $i ++ ) {
			$posts[] = $this->factory()->post->create_and_get( [
				'post_date' => date( 'Y-m-d H:i:s', $older_time + $i ),
				'meta_input' => [
					Document::TYPE_META_KEY => Document::get_type(),
					'_elementor_edit_mode' => 'builder',
				],
			] );
		}

		// Mock kit post - should be excluded.
		$posts[] = $this->factory()->post->create_and_get( [
			'post_title' => 'Some Kit',
			'post_type' => Source_Local::CPT,
			'meta_input' => [
				Document::TYPE_META_KEY => Kit::get_type(),
				'_elementor_edit_mode' => 'builder',
			],
		] );

		// Mock another post with info.
		$posts[] = $this->factory()->post->create_and_get( [
			'post_title' => 'Another Post',
			'post_type' => Source_Local::CPT,
			'meta_input' => [
				Document::TYPE_META_KEY => Landing_Page::get_type(),
				'_elementor_edit_mode' => 'builder',
			],
		] );

		// Act.
		$params = [
			'posts_per_page' => '3',
			'post_type' => [ Source_Local::CPT, 'post', 'page' ],
		];

		$response = $this->send_request( 'GET', self::RECENTLY_EDITED_ENDPOINT, $params );

		// Assert.
		$this->assertEquals( 200, $response->get_status() );

		$expected = [
			$posts[8]->ID,
			$posts[9]->ID,
			$posts[11]->ID,
		];

		$this->assertSameSets(
			$expected,
			wp_list_pluck( $response->get_data(), 'id' ),
			'Expected to get the 3 most recent posts, excluding the kit post'
		);

		$this->assertEquals( 'Another Post', $response->get_data()[0]['title'] );
		$this->assertSameSetsWithIndex( [
			'post_type' => Source_Local::CPT,
			'doc_type' => Landing_Page::get_type(),
			'label' => 'Landing Page',
		], $response->get_data()[0]['type'] );
	}

	public function test_get_items__with_exclude() {
		// Arrange.
		$this->act_as_editor();

		$posts = [];
		for ( $i = 0; $i < 5; $i ++ ) {
			$posts[] = $this->factory()->post->create_and_get( [
				'meta_input' => [
					Document::TYPE_META_KEY => Document::get_type(),
					'_elementor_edit_mode' => 'builder',
				],
			] );
		}

		// Mock kit post - should be excluded.
		$posts[] = $this->factory()->post->create_and_get( [
			'post_title' => 'Some Kit',
			'post_type' => Source_Local::CPT,
			'meta_input' => [
				Document::TYPE_META_KEY => Kit::get_type(),
				'_elementor_edit_mode' => 'builder',
			],
		] );

		// Act.
		$params = [
			'posts_per_page' => '3',
			'post_type' => [ 'elementor_library', 'post', 'page' ],
			'post__not_in' => [ $posts[1]->ID, $posts[3]->ID ],
		];

		$response = $this->send_request( 'GET', self::RECENTLY_EDITED_ENDPOINT, $params );

		// Assert.
		$this->assertEquals( 200, $response->get_status() );

		$expected = [
			$posts[0]->ID,
			$posts[2]->ID,
			$posts[4]->ID,
		];

		$this->assertSameSets(
			$expected,
			wp_list_pluck( $response->get_data(), 'id' ),
			'Expected to get posts excluding the specified posts'
		);
	}

	/**
	 * Test access denied
	 */
	public function test_create_items__forbidden() {
		// Arrange.
		$this->act_as_subscriber();

		// Act.
		$response = $this->send_request( 'POST', self::ADD_NEW_POST_ENDPOINT );

		// Assert.
		$this->assertEquals( 401, $response->get_status() );
	}


	/**
	 * Test invalid post type
	 */
	public function test_create_items__invalid_post_type() {
		// Arrange.
		$this->act_as_editor();

		// Act.
		$params = [
			'post_type' => 'test',
		];
		$response = $this->send_request( 'POST', self::ADD_NEW_POST_ENDPOINT, $params );
		// Assert.
		$this->assertEquals( 400, $response->get_status() );
	}

	public function test_create_items() {
		// Arrange.
		$this->act_as_editor();

		$response = $this->send_request( 'POST', self::ADD_NEW_POST_ENDPOINT );

		// Assert.
		$this->assertEquals( 200, $response->get_status() );

		$edit_url = $response->get_data()['edit_url'];
		$post_id = $response->get_data()['id'];
		$expected_edit_url = 'wp-admin/post.php?post=' . $post_id . '&action=elementor';
		$this->assertStringContainsString( $expected_edit_url, $edit_url );
	}


	/**
	 * Test invalid post id - duplicate post
	 */
	public function test_create_items__invalid_post_id() {
		// Arrange.
		$this->module = new Module();
		$this->act_as_editor();

		// Act.
		$params = [
			'post_id' => 'test',
			'title' => 'test page',
		];

		$response = $this->send_request( 'POST', self::DUPLICATE_POST_ENDPOINT, $params );
		// Assert.
		$this->assertEquals( 400, $response->get_status() );
	}

	public function test_create_items_duplicate_post() {
		// Arrange.
		$this->act_as_editor();

		// Act.
		$post = self::factory()->post->create( [
			'post_type' => 'post',
			'post_title' => 'Test Post',
			'post_status' => 'publish',
		] );

		$params = [
			'post_id' => $post,
		];

		$response = $this->send_request( 'POST', self::DUPLICATE_POST_ENDPOINT, $params );

		// Assert.
		$this->assertEquals( 200, $response->get_status() );

		$duplicated_post_id = $response->get_data()['post_id'];

		$this->assertTrue( $duplicated_post_id > $post );
	}

	public function test_create_items_duplicate_post__invalid_post_id() {
		// Arrange.
		$this->act_as_editor();

		// Act.
		$params = [
			'post_id' => 'test',
			'title' => 'test page',
		];

		$response = $this->send_request( 'POST', self::DUPLICATE_POST_ENDPOINT, $params );

		// Assert.
		$this->assertEquals( 400, $response->get_status() );
	}

	public function test_create_items_duplicate_post__forbidden() {
		// Arrange.
		$this->act_as_subscriber();

		// Act.
		$post = self::factory()->post->create( [
			'post_type' => 'post',
			'post_title' => 'Test Post',
			'post_status' => 'publish',
		] );

		$params = [
			'post_id' => $post,
			'title' => 'test page',
		];

		$response = $this->send_request( 'POST', self::DUPLICATE_POST_ENDPOINT, $params );

		// Assert.
		$this->assertEquals( 401, $response->get_status() );
	}

	/**
	 * @param string $method
	 * @param string $endpoint
	 * @param array $params
	 *
	 * @return \WP_REST_Response
	 */
	private function send_request( string $method, string $endpoint, array $params = [] ): \WP_REST_Response {
		$request = new \WP_REST_Request( $method, "/elementor/v1{$endpoint}" );

		foreach ( $params as $key => $value ) {
			$request->set_param( $key, $value );
		}

		return rest_do_request( $request );
	}

}
