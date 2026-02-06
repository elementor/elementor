<?php

namespace Elementor\Tests\Phpunit\Elementor\App\Modules\E_Onboarding\Data\Endpoints;

use Elementor\App\Modules\E_Onboarding\Data\Endpoints\User_Choices;
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

	public function test_get_items_returns_saved_choices() {
		// Arrange
		$this->repository->update_choices( [
			'building_for' => 'myself',
			'site_about' => [ 'blog' ],
		] );

		$request = new WP_REST_Request( 'GET' );

		// Act
		$result = $this->endpoint->get_items( $request );

		// Assert
		$this->assertSame( 'myself', $result['data']['building_for'] );
		$this->assertSame( [ 'blog' ], $result['data']['site_about'] );
	}

	public function test_update_items_saves_choices() {
		// Arrange
		$request = new WP_REST_Request( 'POST' );
		$request->set_body( json_encode( [
			'building_for' => 'client',
			'experience_level' => 'advanced',
			'site_about' => [ 'blog', 'portfolio', 'ecommerce' ],
			'site_features' => [ 'contact_form', 'gallery' ],
		] ) );
		$request->set_header( 'Content-Type', 'application/json' );

		// Act
		$result = $this->endpoint->update_items( $request );

		// Assert
		$this->assertSame( 'success', $result['data'] );
		$this->assertSame( 'client', $result['choices']['building_for'] );
		$this->assertSame( 'advanced', $result['choices']['experience_level'] );
		$this->assertSame( [ 'blog', 'portfolio', 'ecommerce' ], $result['choices']['site_about'] );
		$this->assertSame( [ 'contact_form', 'gallery' ], $result['choices']['site_features'] );
	}

	public function test_update_items_rejects_invalid_types() {
		// Arrange - invalid types: building_for should be string, site_about should be array
		$request = new WP_REST_Request( 'POST' );
		$request->set_body( json_encode( [
			'building_for' => 123,
		] ) );
		$request->set_header( 'Content-Type', 'application/json' );

		// Act
		$result = $this->endpoint->update_items( $request );

		// Assert
		$this->assertInstanceOf( \WP_Error::class, $result );
	}

	public function test_update_items_with_empty_body_succeeds() {
		// Arrange
		$request = new WP_REST_Request( 'POST' );
		$request->set_body( json_encode( [] ) );
		$request->set_header( 'Content-Type', 'application/json' );

		// Act
		$result = $this->endpoint->update_items( $request );

		// Assert
		$this->assertSame( 'success', $result['data'] );
	}
}
