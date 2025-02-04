<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\WpRest;

use Elementor\Core\Isolation\Wordpress_Adapter_Interface;
use ElementorEditorTesting\Elementor_Test_Base;
use Elementor\Modules\WpRest\Classes\WP_Post;
use Elementor\Modules\WpRest\Module as WpRestModule;
use Elementor\Tests\Phpunit\Elementor\Modules\WpRest\Isolation\Wordpress_Adapter;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Elementor_Post_Query extends Elementor_Test_Base {
	const URL = '/elementor/v1/post';

	protected ?Wordpress_Adapter_Interface $wordpress_adapter;
	protected ?WpRestModule $rest_module;

	public function setUp(): void {
		parent::setUp();

		$this->act_as_admin();
		$this->wordpress_adapter = new Wordpress_Adapter();

		add_action( 'rest_api_init', function () {
			( new WP_Post( $this->wordpress_adapter ) )->register();
		} );

		do_action( 'rest_api_init' );
	}

	public function tearDown(): void {
		parent::tearDown();
	}

	public function test_register() {
		// Arrange

		$request = new \WP_REST_Request( 'GET', self::URL );
		$request->set_param( WP_Post::EXCLUDED_POST_TYPES_KEY, wp_json_encode( [ 'page' ] ) );
		$request->set_param( WP_Post::TERM_KEY, 'Us' );
		$request->set_param( WP_Post::KEYS_FORMAT_MAP_KEY, wp_json_encode( [
			'ID' => 'id',
			'title' => 'label',
			'post_type' => 'groupLabel',
		] ) );

		// Act
		$response = rest_get_server()->dispatch( $request );
		$data = $response->get_data();
		var_dump( $data );

		// Assert
	}
}
