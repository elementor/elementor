<?php
namespace Elementor\Testing\Includes\TemplateLibrary;

use Elementor\Plugin;
use Elementor\Data\V2\Manager;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Templates extends Elementor_Test_Base {
	/**
	 * @var Manager
	 */
	private $manager;

	public function setUp(): void {
		parent::setUp();

		$this->manager = Manager::instance();
	}

	public function tearDown(): void {
		parent::tearDown();

		$this->manager->kill_server();
	}

	public function test_create_new_template() {
		$this->act_as_admin();

		$response = $this->manager->run_endpoint( 'template-library/templates', [
			'title' => 'My custom template',
			'type' => 'page'
		], 'POST' );

		$document = Plugin::$instance->documents->get( $response['template_id'] );

		$this->assertNotNull( $document );
		$this->assertEquals( 'page', $response['type'] );
		$this->assertEquals( 'page', $document->get_template_type() );
		$this->assertTrue( $document->is_built_with_elementor() );
	}

	public function test_create_new_template__unauthorized_creating_template() {
		$this->act_as_subscriber();

		$response = $this->manager->run_endpoint( 'template-library/templates', [
			'title' => 'My custom template',
			'type' => 'page'
		], 'POST' );

		$this->assertEquals( 'rest_forbidden', $response['code'] );
		$this->assertEquals( 403, $response['data']['status'] );
	}

	public function test_create_new_template__document_type_is_required() {
		$this->act_as_admin();

		$response = $this->manager->run_endpoint( 'template-library/templates', [
			'title' => 'My custom template',
		], 'POST' );

		$this->assertEquals( 'rest_missing_callback_param', $response['code'] );
		$this->assertEquals( 400, $response['data']['status'] );
		$this->assertTrue( in_array( 'type', $response['data']['params'], true ) );
	}

	public function test_create_new_template__document_type_must_be_valid() {
		$this->act_as_admin();

		$response = $this->manager->run_endpoint( 'template-library/templates', [
			'title' => 'My custom template',
			'type' => 'this is not a document valid document type'
		], 'POST' );

		$this->assertEquals( 'rest_invalid_param', $response['code'] );
		$this->assertEquals( 400, $response['data']['status'] );
		$this->assertTrue( array_key_exists( 'type', $response['data']['params'] ) );
	}
}
