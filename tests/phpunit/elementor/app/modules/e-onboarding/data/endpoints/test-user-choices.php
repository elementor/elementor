<?php

namespace Elementor\Tests\Phpunit\Elementor\App\Modules\E_Onboarding\Data\Endpoints;

use Elementor\App\Modules\E_Onboarding\Data\Endpoints\User_Choices;
use Elementor\App\Modules\E_Onboarding\Storage\Repository;
use Elementor\Tests\Phpunit\Elementor\App\Modules\E_Onboarding\Test_Base;
use WP_REST_Request;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_User_Choices extends Test_Base {

	private User_Choices $endpoint;

	public function setUp(): void {
		parent::setUp();

		$controller = $this->createMock( \Elementor\Data\V2\Base\Controller::class );
		$this->endpoint = new User_Choices( $controller );
	}

	public function test_get_name_returns_user_choices() {
		// Assert
		$this->assertSame( 'user-choices', $this->endpoint->get_name() );
	}

	public function test_get_format_returns_e_onboarding() {
		// Assert
		$this->assertSame( 'e-onboarding', $this->endpoint->get_format() );
	}

	public function test_get_items_returns_choices_data() {
		// Arrange
		$this->repository->update_choices( [
			'building_for' => 'myself',
			'site_about' => [ 'blog' ],
		] );

		$request = new WP_REST_Request( 'GET' );

		// Act
		$result = $this->endpoint->get_items( $request );

		// Assert
		$this->assertIsArray( $result );
		$this->assertArrayHasKey( 'data', $result );
		$this->assertSame( 'myself', $result['data']['building_for'] );
		$this->assertSame( [ 'blog' ], $result['data']['site_about'] );
	}

	public function test_update_items_updates_choices() {
		// Arrange
		$request = new WP_REST_Request( 'POST' );
		$request->set_body( json_encode( [
			'building_for' => 'client',
			'experience_level' => 'advanced',
		] ) );
		$request->set_header( 'Content-Type', 'application/json' );

		// Act
		$result = $this->endpoint->update_items( $request );

		// Assert
		$this->assertIsArray( $result );
		$this->assertSame( 'success', $result['data'] );
		$this->assertSame( 'client', $result['choices']['building_for'] );
		$this->assertSame( 'advanced', $result['choices']['experience_level'] );
	}

	public function test_update_items_validates_input() {
		// Arrange
		$request = new WP_REST_Request( 'POST' );
		$request->set_body( json_encode( [
			'building_for' => 123, // Invalid - should be string
		] ) );
		$request->set_header( 'Content-Type', 'application/json' );

		// Act
		$result = $this->endpoint->update_items( $request );

		// Assert
		$this->assertInstanceOf( \WP_Error::class, $result );
		$this->assertSame( 'invalid_building_for', $result->get_error_code() );
	}

	public function test_update_items_with_empty_params_returns_success() {
		// Arrange
		$request = new WP_REST_Request( 'POST' );
		$request->set_body( json_encode( [] ) );
		$request->set_header( 'Content-Type', 'application/json' );

		// Act
		$result = $this->endpoint->update_items( $request );

		// Assert
		$this->assertIsArray( $result );
		$this->assertSame( 'success', $result['data'] );
	}

	public function test_update_items_with_null_params_returns_success() {
		// Arrange
		$request = new WP_REST_Request( 'POST' );
		$request->set_body( 'null' );
		$request->set_header( 'Content-Type', 'application/json' );

		// Act
		$result = $this->endpoint->update_items( $request );

		// Assert
		$this->assertIsArray( $result );
		$this->assertSame( 'success', $result['data'] );
	}

	public function test_update_items_updates_site_about_array() {
		// Arrange
		$request = new WP_REST_Request( 'POST' );
		$request->set_body( json_encode( [
			'site_about' => [ 'blog', 'portfolio', 'ecommerce' ],
		] ) );
		$request->set_header( 'Content-Type', 'application/json' );

		// Act
		$result = $this->endpoint->update_items( $request );

		// Assert
		$this->assertIsArray( $result );
		$this->assertSame( [ 'blog', 'portfolio', 'ecommerce' ], $result['choices']['site_about'] );
	}

	public function test_update_items_updates_site_features_array() {
		// Arrange
		$request = new WP_REST_Request( 'POST' );
		$request->set_body( json_encode( [
			'site_features' => [ 'contact_form', 'gallery' ],
		] ) );
		$request->set_header( 'Content-Type', 'application/json' );

		// Act
		$result = $this->endpoint->update_items( $request );

		// Assert
		$this->assertIsArray( $result );
		$this->assertSame( [ 'contact_form', 'gallery' ], $result['choices']['site_features'] );
	}

	public function test_update_items_rejects_invalid_site_about() {
		// Arrange
		$request = new WP_REST_Request( 'POST' );
		$request->set_body( json_encode( [
			'site_about' => 'not_an_array',
		] ) );
		$request->set_header( 'Content-Type', 'application/json' );

		// Act
		$result = $this->endpoint->update_items( $request );

		// Assert
		$this->assertInstanceOf( \WP_Error::class, $result );
		$this->assertSame( 'invalid_site_about', $result->get_error_code() );
	}
}
