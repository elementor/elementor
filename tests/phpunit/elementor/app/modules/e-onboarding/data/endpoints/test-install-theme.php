<?php

namespace Elementor\Tests\Phpunit\Elementor\App\Modules\E_Onboarding\Data\Endpoints;

use Elementor\App\Modules\E_Onboarding\Data\Endpoints\Install_Theme;
use Elementor\Plugin;
use Elementor\Tests\Phpunit\Elementor\App\Modules\E_Onboarding\Test_Base;
use WP_REST_Request;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Install_Theme extends Test_Base {

	private Install_Theme $endpoint;

	public function setUp(): void {
		parent::setUp();

		Plugin::$instance->data_manager_v2->run_server();
		$controller = Plugin::$instance->data_manager_v2->get_controller( 'e-onboarding' );
		$this->endpoint = $controller->endpoints['e-onboarding/install-theme'];
	}

	public function test_allowed_themes_constant_contains_expected_themes() {
		$this->assertContains( 'hello-elementor', Install_Theme::ALLOWED_THEMES );
		$this->assertContains( 'hello-biz', Install_Theme::ALLOWED_THEMES );
		$this->assertCount( 2, Install_Theme::ALLOWED_THEMES );
	}

	public function test_rejects_empty_theme_slug() {
		// Arrange
		$request = new WP_REST_Request( 'POST' );
		$request->set_body( json_encode( [ 'theme_slug' => '' ] ) );
		$request->set_header( 'Content-Type', 'application/json' );

		// Act
		$result = $this->endpoint->create_items( $request );

		// Assert
		$this->assertInstanceOf( \WP_Error::class, $result );
		$this->assertSame( 'invalid_theme', $result->get_error_code() );
	}

	public function test_rejects_missing_theme_slug() {
		// Arrange
		$request = new WP_REST_Request( 'POST' );
		$request->set_body( json_encode( [] ) );
		$request->set_header( 'Content-Type', 'application/json' );

		// Act
		$result = $this->endpoint->create_items( $request );

		// Assert
		$this->assertInstanceOf( \WP_Error::class, $result );
		$this->assertSame( 'invalid_theme', $result->get_error_code() );
	}

	public function test_rejects_non_allowed_theme() {
		// Arrange
		$request = new WP_REST_Request( 'POST' );
		$request->set_body( json_encode( [ 'theme_slug' => 'twentytwentyfive' ] ) );
		$request->set_header( 'Content-Type', 'application/json' );

		// Act
		$result = $this->endpoint->create_items( $request );

		// Assert
		$this->assertInstanceOf( \WP_Error::class, $result );
		$this->assertSame( 'invalid_theme', $result->get_error_code() );
	}

	public function test_rejects_insufficient_permissions() {
		// Arrange - subscriber has manage_options=false, so check_permission fails first
		wp_set_current_user( self::factory()->user->create( [ 'role' => 'subscriber' ] ) );

		$request = new WP_REST_Request( 'POST' );
		$request->set_body( json_encode( [ 'theme_slug' => 'hello-elementor' ] ) );
		$request->set_header( 'Content-Type', 'application/json' );

		// Act
		$result = $this->endpoint->create_items( $request );

		// Assert
		$this->assertInstanceOf( \WP_Error::class, $result );
	}

	public function test_installs_and_activates_existing_theme() {
		// Arrange - hello-elementor ships with Elementor tests, so it should exist
		$request = new WP_REST_Request( 'POST' );
		$request->set_body( json_encode( [ 'theme_slug' => 'hello-elementor' ] ) );
		$request->set_header( 'Content-Type', 'application/json' );

		// Act
		$result = $this->endpoint->create_items( $request );

		// Assert
		if ( ! is_wp_error( $result ) ) {
			$this->assertTrue( $result['data']['success'] );
			$this->assertSame( 'hello-elementor', get_stylesheet() );
		}
	}
}
