<?php

namespace Elementor\Tests\Modules\Variables\Classes;

use Elementor\Core\Kits\Documents\Kit;
use Elementor\Modules\Variables\Classes\Rest_Api;
use Elementor\Modules\Variables\Storage\Repository as Variables_Repository;
use Elementor\Modules\Variables\PropTypes\Color_Variable_Prop_Type;
use Elementor\Modules\Variables\PropTypes\Font_Variable_Prop_Type;
use ElementorEditorTesting\Elementor_Test_Base;
use WP_REST_Request;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * @group Elementor
 * @group Elementor\Modules
 * @group Elementor\Modules\Variables
 */
class Test_Rest_Api extends Elementor_Test_Base {
	/**
	 * @var Rest_Api
	 */
	private $rest_api;

	/**
	 * @var Kit
	 */
	private $kit;

	public function setUp(): void {
		parent::setUp();

		$this->kit = $this->createMock( Kit::class );

		$this->rest_api = new Rest_Api(
			new Variables_Repository( $this->kit )
		);
	}

	public function test_admin_user__has__enough_permissions_to_perform_action() {
		$this->act_as_admin();
		$this->assertTrue( $this->rest_api->enough_permissions_to_perform_ro_action() );
		$this->assertTrue( $this->rest_api->enough_permissions_to_perform_rw_action() );
	}

	public function test_author_user__has__enough_permissions_to_perform_actions() {
		$this->act_as( 'author' );
		$this->assertTrue( $this->rest_api->enough_permissions_to_perform_ro_action() );
		$this->assertFalse( $this->rest_api->enough_permissions_to_perform_rw_action() );
	}

	public function test_editor_user__has__enough_permissions_to_perform_action() {
		$this->act_as_editor();
		$this->assertTrue( $this->rest_api->enough_permissions_to_perform_ro_action() );
		$this->assertFalse( $this->rest_api->enough_permissions_to_perform_rw_action() );
	}

	public function test_subscriber_user__does_not_have__enough_permissions_to_perform_action() {
		$this->act_as_subscriber();
		$this->assertFalse( $this->rest_api->enough_permissions_to_perform_ro_action() );
		$this->assertFalse( $this->rest_api->enough_permissions_to_perform_rw_action() );
	}

	public function test_create_variable__with_valid_data() {
		// Arrange
		$this->act_as_admin();

		$this->kit
			->expects( $this->once() )
			->method( 'get_json_meta' )
			->willReturn( null );

		$this->kit
			->expects( $this->once() )
			->method( 'update_json_meta' )
			->willReturn( true );

		// Act
		$request = new WP_REST_Request( 'POST', '/elementor/v1/variables/create' );
		$request->set_body_params( [
			'type' => Color_Variable_Prop_Type::get_key(),
			'label' => 'primary-color',
			'value' => '#00FF00',
		] );

		$response = $this->rest_api->create_variable( $request );

		// Assert
		$this->assertEquals( 201, $response->get_status() );

		$response_data = $response->get_data();

		$this->assertTrue( $response_data['success'] );

		$this->assertNotEmpty( $response_data['data']['variable']['id'] );

		$this->assertEquals( Color_Variable_Prop_Type::get_key(), $response_data['data']['variable']['type'] );
		$this->assertEquals( 'primary-color', $response_data['data']['variable']['label'] );
		$this->assertEquals( '#00FF00', $response_data['data']['variable']['value'] );

		$this->assertEquals( 1, $response_data['data']['watermark'], 'Watermark validation failed' );
	}

	public function test_update_variable__with_valid_data() {
		// Arrange
		$this->act_as_admin();

		$this->kit
			->expects( $this->once() )
			->method( 'get_json_meta' )
			->willReturn( [
				'data' => [
					'color-1' => [
						'type' => Color_Variable_Prop_Type::get_key(),
						'label' => 'Primary Color',
						'value' => '#FF0000',
					],
				],
				'watermark' => 10,
			] );

		$this->kit
			->expects( $this->once() )
			->method( 'update_json_meta' )
			->willReturn( true );

		// Act
		$request = new WP_REST_Request( 'PUT', '/elementor/v1/variables/update' );
		$request->set_body_params( [
			'id' => 'color-1',
			'label' => 'Updated Color',
			'value' => '#0000FF',
		] );

		$response = $this->rest_api->update_variable( $request );

		// Assert
		$this->assertEquals( 200, $response->get_status() );

		$response_data = $response->get_data();

		$this->assertTrue( $response_data['success'] );

		$this->assertEquals( 11, $response_data['data']['watermark'], 'Watermark validation failed' );

		$this->assertEquals( 'Updated Color', $response_data['data']['variable']['label'] );
		$this->assertEquals( '#0000FF', $response_data['data']['variable']['value'] );
		$this->assertEquals( Color_Variable_Prop_Type::get_key(), $response_data['data']['variable']['type'] );
		$this->assertEquals( 'color-1', $response_data['data']['variable']['id'] );
	}

	public function test_delete_variable() {
		// Arrange
		$this->act_as_admin();

		$this->kit
			->expects( $this->once() )
			->method( 'get_json_meta' )
			->willReturn( [
				'data' => [
					'color-1' => [
						'type' => Color_Variable_Prop_Type::get_key(),
						'label' => 'Primary Color',
						'value' => '#FF0000',
					],
				],
				'watermark' => 10,
			] );

		$this->kit
			->expects( $this->once() )
			->method( 'update_json_meta' )
			->willReturn( true );

		// Act
		$request = new WP_REST_Request( 'DELETE', '/elementor/v1/variables/delete' );
		$request->set_body_params( [
			'id' => 'color-1',
		] );

		$response = $this->rest_api->delete_variable( $request );

		// Assert
		$this->assertEquals(200, $response->get_status());

		$response_data = $response->get_data();

		$this->assertEquals( 11, $response_data['data']['watermark'], 'Watermark validation failed' );

		$this->assertTrue( $response_data['success'] );

		$this->assertEquals( Color_Variable_Prop_Type::get_key(), $response_data['data']['variable']['type'] );
		$this->assertEquals( 'Primary Color', $response_data['data']['variable']['label'] );
		$this->assertEquals( '#FF0000', $response_data['data']['variable']['value'] );
		$this->assertTrue( $response_data['data']['variable']['deleted'] );
		$this->assertNotEmpty( $response_data['data']['variable']['deleted_at'] );
	}

	public function test_delete_non_existing_variable() {
		// Arrange
		$this->act_as_admin();

		$this->kit
			->expects( $this->once() )
			->method( 'get_json_meta' )
			->willReturn( null );

		// Act
		$request = new WP_REST_Request( 'DELETE', '/elementor/v1/variables/delete' );
		$request->set_body_params( [
			'id' => 'color-1',
		] );

		$response = $this->rest_api->delete_variable( $request );

		// Assert
		$this->assertEquals( 404, $response->get_status() );

		$response_data = $response->get_data();

		$this->assertEquals( 'variable_not_found', $response_data['code'] );
	}

	public function test_restore_variable() {
		// Arrange
		$this->act_as_admin();

		$this->kit
			->expects($this->once())
			->method('get_json_meta')
			->willReturn([
				'data' => [
					'color-1' => [
						'type' => Color_Variable_Prop_Type::get_key(),
						'label' => 'Primary Color',
						'value' => '#FF0000',
						'deleted' => true,
						'deleted_at' => '2021-01-01 00:00:00',
					],
				],
				'watermark' => 10,
			]);

		$this->kit
			->expects( $this->once() )
			->method( 'update_json_meta' )
			->willReturn( true );

		// Act
		$request = new WP_REST_Request( 'PUT', '/elementor/v1/variables/restore' );
		$request->set_body_params( [
			'id' => 'color-1',
		] );

		$response = $this->rest_api->restore_variable( $request );

		// Assert
		$this->assertEquals( 200, $response->get_status() );

		$response_data = $response->get_data();

		$this->assertEquals( 11, $response_data['data']['watermark'], 'Watermark validation failed' );

		$this->assertEquals( 'Primary Color', $response_data['data']['variable']['label'] );
		$this->assertEquals( '#FF0000', $response_data['data']['variable']['value'] );
		$this->assertArrayNotHasKey( 'deleted', $response_data['data']['variable'] );
		$this->assertArrayNotHasKey( 'deleted_at', $response_data['data']['variable'] );
	}

	public function test_restore_variable__with_overrides() {
		// Arrange
		$this->act_as_admin();

		$this->kit
			->expects( $this->once() )
			->method( 'get_json_meta' )
			->willReturn( [
				'data' => [
					'id-a01' => [
						'type' => Color_Variable_Prop_Type::get_key(),
						'label' => 'primary-text-color',
						'value' => '#404040',
						'deleted' => true,
						'deleted_at' => '2021-01-01 00:00:00',
					],
					'id-a02' => [
						'type' => Color_Variable_Prop_Type::get_key(),
						'label' => 'primary-text-color',
						'value' => '#202020',
					],
				],
				'watermark' => 5,
			] );

		$this->kit
			->expects( $this->once() )
			->method( 'update_json_meta' )
			->willReturn( true );

		// Act
		$request = new WP_REST_Request( 'PUT', '/elementor/v1/variables/restore' );
		$request->set_body_params( [
			'id' => 'id-a01',
			'label' => 'main-text-color',
			'value' => '#202020',
		] );

		$response = $this->rest_api->restore_variable( $request );

		// Assert
		$this->assertEquals( 200, $response->get_status() );

		$response_data = $response->get_data();

		$this->assertEquals( 6, $response_data['data']['watermark'], 'Watermark validation failed' );

		$this->assertEquals( 'main-text-color', $response_data['data']['variable']['label'] );
		$this->assertEquals( '#202020', $response_data['data']['variable']['value'] );
		$this->assertArrayNotHasKey( 'deleted', $response_data['data']['variable'] );
		$this->assertArrayNotHasKey( 'deleted_at', $response_data['data']['variable'] );
	}

	public function test_restore_variable__with_overrides_and_duplicated_label__results_in_bad_request() {
		// Arrange
		$this->act_as_admin();

		$this->kit
			->expects( $this->once() )
			->method( 'get_json_meta' )
			->willReturn( [
				'data' => [
					'id-a01' => [
						'type' => Color_Variable_Prop_Type::get_key(),
						'label' => 'primary-text-color',
						'value' => '#404040',
						'deleted' => true,
						'deleted_at' => '2021-01-01 00:00:00',
					],
					'id-a02' => [
						'type' => Color_Variable_Prop_Type::get_key(),
						'label' => 'primary-text-color',
						'value' => '#404040',
					],
					'id-a03' => [
						'type' => Color_Variable_Prop_Type::get_key(),
						'label' => 'main-text-color',
						'value' => '#404040',
					],
				],
				'watermark' => 5,
			] );

		$this->kit
			->expects( $this->never() )
			->method( 'update_json_meta' );

		// Act
		$request = new WP_REST_Request( 'PUT', '/elementor/v1/variables/restore' );
		$request->set_body_params( [
			'id' => 'id-a01',
			'label' => 'main-text-color',
			'value' => '#202020',
		] );

		$response = $this->rest_api->restore_variable( $request );

		// Assert
		$this->assertEquals( 400, $response->get_status() );

		$response_data = $response->get_data();

		$this->assertEquals( 'duplicated_label', $response_data['code'] );
	}

	public function test_get_variables() {
		// Arrange
		$this->act_as_admin();

		$this->kit
			->expects( $this->once() )
			->method( 'get_json_meta' )
			->willReturn( [
				'data' => [
					'color-1' => [
						'type' => Color_Variable_Prop_Type::get_key(),
						'label' => 'Primary Color',
						'value' => '#FF0000',
					],
					'color-2' => [
						'type' => Font_Variable_Prop_Type::get_key(),
						'label' => 'Primary Font',
						'value' => 'Arial',
						'deleted' => true,
						'deleted_at' => '2021-01-01 00:00:00',
					],
				],
				'watermark' => 10,
			]);

		// Act
		$response = $this->rest_api->get_variables();

		// Assert
		$this->assertEquals(200, $response->get_status());

		$response_data = $response->get_data();

		$this->assertTrue( $response_data['success'] );

		$this->assertEquals( 10, $response_data['data']['watermark'], 'Watermark validation failed' );

		$this->assertCount( 2, $response_data['data']['variables'] );
		$this->assertEquals( 2, $response_data['data']['total'] );
	}

	public function test_validation_functions() {
		// Test ID validation
		$this->assertTrue($this->rest_api->is_valid_variable_id('valid-id'));
		$this->assertWPError($this->rest_api->is_valid_variable_id(''));
		$this->assertWPError($this->rest_api->is_valid_variable_id(str_repeat('a', 65)));

		// Test type validation
		$this->assertTrue($this->rest_api->is_valid_variable_type(Color_Variable_Prop_Type::get_key()));
		$this->assertTrue($this->rest_api->is_valid_variable_type(Font_Variable_Prop_Type::get_key()));
		$this->assertFalse($this->rest_api->is_valid_variable_type('invalid-type'));

		// Test label validation
		$this->assertTrue($this->rest_api->is_valid_variable_label('Valid Label'));
		$this->assertWPError($this->rest_api->is_valid_variable_label(''));
		$this->assertWPError($this->rest_api->is_valid_variable_label(str_repeat('a', 51)));

		// Test value validation
		$this->assertTrue($this->rest_api->is_valid_variable_value('Valid Value'));
		$this->assertWPError($this->rest_api->is_valid_variable_value(''));
		$this->assertWPError($this->rest_api->is_valid_variable_value(str_repeat('a', 513)));
	}

	public function test_variables_limit_reached() {
		// Arrange
		$this->act_as_admin();

		$this->kit
			->expects( $this->once() )
			->method( 'get_json_meta' )
			->willReturn( [
				'data' => array_fill( 0, Variables_Repository::TOTAL_VARIABLES_COUNT, [
					'type' => Color_Variable_Prop_Type::get_key(),
					'label' => 'primary-color',
					'value' => '#FF0000',
				] ),
				'watermark' => 10,
			] );

		// Act
		$request = new WP_REST_Request( 'POST', '/elementor/v1/variables/create' );
		$request->set_body_params( [
			'type' => Color_Variable_Prop_Type::get_key(),
			'label' => 'new-variable',
			'value' => '#FF0000',
		] );

		$response = $this->rest_api->create_variable( $request );

		// Assert
		$this->assertEquals( 400, $response->get_status() );

		$response_data = $response->get_data();

		$this->assertEquals( 'invalid_variable_limit_reached', $response_data['code'] );
	}

	public function test_trim_and_sanitize_text_field() {
		// Test regular text is accepted
		$this->assertEquals(
			'sample-label',
			$this->rest_api->trim_and_sanitize_text_field('sample-label')
		);

		// Test sample color value
		$this->assertEquals(
			'rgba(0, 0, 0, 0.5)',
			$this->rest_api->trim_and_sanitize_text_field('  rgba(0, 0, 0, 0.5)  ')
		);

		// Test hex color value
		$this->assertEquals(
			'#00ff00',
			$this->rest_api->trim_and_sanitize_text_field('  #00ff00  ')
		);

		// Test XSS attempts are sanitized
		$this->assertEquals(
			'Alert',
			$this->rest_api->trim_and_sanitize_text_field('<script>alert("XSS")</script>Alert')
		);

		$this->assertEquals(
			'onclick',
			$this->rest_api->trim_and_sanitize_text_field('<a href="javascript:alert(\'XSS\')" >onclick</a>')
		);

		$this->assertEquals(
			'img',
			$this->rest_api->trim_and_sanitize_text_field('<img src="x" onerror="alert(\'XSS\')">img')
		);

		// Test HTML entities are encoded
		$this->assertEquals(
			'bold',
			$this->rest_api->trim_and_sanitize_text_field('<strong>bold</strong>')
		);
	}
}
