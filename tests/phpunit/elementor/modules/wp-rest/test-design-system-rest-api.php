<?php

namespace Elementor\Testing\Modules\WpRest;

use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Modules\Variables\Storage\Constants as Variables_Constants;
use Elementor\Modules\Variables\Storage\Variables_Repository;
use Elementor\Modules\WpRest\Classes\Design_System_REST_API;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * @group site-builder
 */
class Test_Design_System_Rest_Api extends Elementor_Test_Base {

	private const ROUTE = '/' . Design_System_REST_API::API_NAMESPACE . '/' . Design_System_REST_API::API_BASE;

	private $kit;

	private $mock_global_classes = [
		'items' => [
			'g-1' => [
				'id' => 'g-1',
				'label' => 'heading',
				'variants' => [],
			],
			'g-2' => [
				'id' => 'g-2',
				'label' => 'subheading',
				'variants' => [],
			],
		],
		'order' => [ 'g-1', 'g-2' ],
	];

	private $mock_global_variables = [
		'data' => [
			'e-gv-1' => [
				'type' => 'global-color-variable',
				'label' => 'Primary',
				'value' => '#a04343',
			],
		],
		'watermark' => 7,
		'version' => 1,
	];

	public function setUp(): void {
		parent::setUp();

		global $wp_rest_server;
		$wp_rest_server = new \WP_REST_Server();

		add_action( 'rest_api_init', function () {
			( new Design_System_REST_API() )->register();
		} );
		do_action( 'rest_api_init' );

		$this->kit = Plugin::$instance->kits_manager->get_active_kit();
	}

	public function tearDown(): void {
		$this->kit->delete_meta( Global_Classes_Repository::META_KEY_FRONTEND );
		$this->kit->delete_meta( Global_Classes_Repository::META_KEY_PREVIEW );
		$this->kit->delete_meta( Variables_Constants::VARIABLES_META_KEY );

		parent::tearDown();
	}

	public function test_deploy__writes_global_classes_via_repository() {
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', self::ROUTE );
		$request->set_body_params( [ 'globalClasses' => $this->mock_global_classes ] );

		$response = rest_do_request( $request );

		$this->assertEquals( 200, $response->get_status() );

		$stored = Global_Classes_Repository::make()
			->context( Global_Classes_Repository::CONTEXT_FRONTEND )
			->all( true )
			->get();

		$this->assertEquals( $this->mock_global_classes['items'], $stored['items'] );
		$this->assertEquals( $this->mock_global_classes['order'], $stored['order'] );
	}

	public function test_deploy__writes_global_variables_via_repository() {
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', self::ROUTE );
		$request->set_body_params( [ 'globalVariables' => $this->mock_global_variables ] );

		$response = rest_do_request( $request );

		$this->assertEquals( 200, $response->get_status() );

		$collection = ( new Variables_Repository( $this->kit ) )->load();

		$this->assertCount( 1, $collection->all() );
		$this->assertEquals( 'Primary', $collection->get( 'e-gv-1' )->label() );
		$this->assertEquals( $this->mock_global_variables['watermark'] + 1, $collection->watermark() );
	}

	public function test_deploy__writes_both_when_payload_includes_both() {
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', self::ROUTE );
		$request->set_body_params( [
			'globalClasses' => $this->mock_global_classes,
			'globalVariables' => $this->mock_global_variables,
		] );

		$response = rest_do_request( $request );

		$this->assertEquals( 200, $response->get_status() );

		$classes_meta = $this->kit->get_json_meta( Global_Classes_Repository::META_KEY_FRONTEND );
		$collection = ( new Variables_Repository( $this->kit ) )->load();

		$this->assertEquals( $this->mock_global_classes['order'], $classes_meta['order'] );
		$this->assertCount( count( $this->mock_global_variables['data'] ), $collection->all() );
		$this->assertEquals( 'Primary', $collection->get( 'e-gv-1' )->label() );
	}

	public function test_deploy__rejects_empty_payload() {
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', self::ROUTE );

		$response = rest_do_request( $request );

		$this->assertEquals( 400, $response->get_status() );
	}

	public function test_deploy__rejects_non_admin() {
		$this->act_as_subscriber();

		$request = new \WP_REST_Request( 'POST', self::ROUTE );
		$request->set_body_params( [ 'globalClasses' => $this->mock_global_classes ] );

		$response = rest_do_request( $request );

		$this->assertEquals( 403, $response->get_status() );
	}
}
