<?php
namespace Elementor\Testing\Includes\TemplateLibrary;

use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_REST_API extends Elementor_Test_Base {
	public function setUp(  ) {
		parent::setUp();

		do_action( 'rest_api_init' );
	}

	public function test_create_new_template() {
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/wp/v2/elementor-templates' );
		$request->set_body_params( [
			'title' => 'My custom template',
			'document_type' => 'page'
		] );

		$response = rest_do_request( $request );

		$this->assertEquals( 201, $response->status );
		$this->assertEquals( 'page', $response->data['document_type'] );

		$document = Plugin::$instance->documents->get( $response->data['id'] );

		$this->assertNotNull( $document );
		$this->assertEquals( 'page', $document->get_template_type() );
		$this->assertTrue( $document->is_built_with_elementor() );
	}

	public function test_create_new_template__unauthorized_creating_template() {
		$this->act_as_subscriber();

		$request = new \WP_REST_Request( 'POST', '/wp/v2/elementor-templates' );
		$request->set_body_params( [
			'title' => 'My custom template',
			'document_type' => 'page'
		] );

		$response = rest_do_request( $request );

		$this->assertEquals( 403, $response->status );
	}

	public function test_create_new_template__document_type_is_required() {
		$this->act_as_subscriber();

		$request = new \WP_REST_Request( 'POST', '/wp/v2/elementor-templates' );
		$request->set_body_params( [
			'title' => 'My custom template',
		] );

		$response = rest_do_request( $request );

		$this->assertEquals( 400, $response->status );
		$this->assertEquals( 'rest_missing_callback_param', $response->data['code'] );
		$this->assertTrue( in_array( 'document_type', $response->data['data']['params'], true ) );
	}
}
