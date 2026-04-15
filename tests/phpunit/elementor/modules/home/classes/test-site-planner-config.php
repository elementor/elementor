<?php
namespace Elementor\Tests\Phpunit\Elementor\Modules\Home\Classes;

use Elementor\Modules\Home\Classes\Site_Planner_Config;
use PHPUnit\Framework\TestCase as PHPUnit_TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Site_Planner_Config extends PHPUnit_TestCase {

	public function tearDown(): void {
		remove_all_filters( 'elementor/experiments/feature-active' );
		parent::tearDown();
	}

	public function test_get__returns_null_when_site_builder_experiment_inactive() {
		// Arrange
		$config = $this->make_site_planner_config( [
			'is_experiment_active' => false,
		] );

		// Act
		$result = $config->get();

		// Assert
		$this->assertNull( $result );
	}

	public function test_get__returns_null_when_common_not_available() {
		// Arrange
		$config = $this->make_site_planner_config( [
			'is_experiment_active' => true,
			'has_common'           => false,
		] );

		// Act
		$result = $config->get();

		// Assert
		$this->assertNull( $result );
	}

	public function test_get__returns_null_when_connect_component_missing() {
		// Arrange
		$config = $this->make_site_planner_config( [
			'is_experiment_active' => true,
			'has_common'           => true,
			'has_connect'          => false,
		] );

		// Act
		$result = $config->get();

		// Assert
		$this->assertNull( $result );
	}

	public function test_get__returns_null_when_library_app_missing() {
		// Arrange
		$config = $this->make_site_planner_config( [
			'is_experiment_active' => true,
			'has_common'           => true,
			'has_connect'          => true,
			'has_library_app'      => false,
		] );

		// Act
		$result = $config->get();

		// Assert
		$this->assertNull( $result );
	}

	public function test_get__returns_null_when_not_connected() {
		// Arrange
		$config = $this->make_site_planner_config( [
			'is_experiment_active' => true,
			'has_common'           => true,
			'has_connect'          => true,
			'has_library_app'      => true,
			'is_connected'         => false,
		] );

		// Act
		$result = $config->get();

		// Assert
		$this->assertNull( $result );
	}

	public function test_get__returns_config_array_when_connected() {
		// Arrange
		$config = $this->make_site_planner_config( [
			'is_experiment_active'  => true,
			'has_common'            => true,
			'has_connect'           => true,
			'has_library_app'       => true,
			'is_connected'          => true,
			'access_token'          => 'test-token',
			'client_id'             => 'test-client-id',
			'site_key'              => 'test-site-key',
			'access_token_secret'   => 'test-secret',
		] );

		// Act
		$result = $config->get();

		// Assert
		$this->assertIsArray( $result );
		$this->assertArrayHasKey( 'connectAuth', $result );
		$this->assertArrayHasKey( 'apiOrigin', $result );
		$this->assertArrayHasKey( 'siteBuilderUrl', $result );
		$this->assertArrayHasKey( 'previewImage', $result );
		$this->assertArrayHasKey( 'bgImage', $result );
	}

	public function test_get__connect_auth_contains_expected_keys() {
		// Arrange
		$config = $this->make_site_planner_config( [
			'is_experiment_active'  => true,
			'has_common'            => true,
			'has_connect'           => true,
			'has_library_app'       => true,
			'is_connected'          => true,
			'access_token'          => 'my-token',
			'client_id'             => 'my-client',
			'site_key'              => 'my-site-key',
			'access_token_secret'   => 'my-secret',
		] );

		// Act
		$result = $config->get();

		// Assert
		$connect_auth = $result['connectAuth'];
		$this->assertArrayHasKey( 'signature', $connect_auth );
		$this->assertArrayHasKey( 'accessToken', $connect_auth );
		$this->assertArrayHasKey( 'clientId', $connect_auth );
		$this->assertArrayHasKey( 'homeUrl', $connect_auth );
		$this->assertArrayHasKey( 'siteKey', $connect_auth );
		$this->assertEquals( 'my-token', $connect_auth['accessToken'] );
		$this->assertEquals( 'my-client', $connect_auth['clientId'] );
		$this->assertEquals( 'my-site-key', $connect_auth['siteKey'] );
	}

	public function test_get__uses_default_api_origin_when_constant_not_defined() {
		// Arrange
		$config = $this->make_site_planner_config( [
			'is_experiment_active'  => true,
			'has_common'            => true,
			'has_connect'           => true,
			'has_library_app'       => true,
			'is_connected'          => true,
			'access_token'          => 'tok',
			'client_id'             => 'cid',
			'site_key'              => 'sk',
			'access_token_secret'   => 'sec',
		] );

		// Act
		$result = $config->get();

		// Assert
		$this->assertEquals( 'https://my.elementor.com/api/v2/ai', $result['apiOrigin'] );
	}

	public function test_get__uses_default_site_builder_url_when_constant_not_defined() {
		// Arrange
		$config = $this->make_site_planner_config( [
			'is_experiment_active'  => true,
			'has_common'            => true,
			'has_connect'           => true,
			'has_library_app'       => true,
			'is_connected'          => true,
			'access_token'          => 'tok',
			'client_id'             => 'cid',
			'site_key'              => 'sk',
			'access_token_secret'   => 'sec',
		] );

		// Act
		$result = $config->get();

		// Assert
		$this->assertEquals( 'https://planner.elementor.com/chat.html', $result['siteBuilderUrl'] );
	}

	public function test_get__signature_is_deterministic_for_same_inputs() {
		// Arrange
		$args = [
			'is_experiment_active'  => true,
			'has_common'            => true,
			'has_connect'           => true,
			'has_library_app'       => true,
			'is_connected'          => true,
			'access_token'          => 'tok',
			'client_id'             => 'cid',
			'site_key'              => 'sk',
			'access_token_secret'   => 'sec',
		];

		// Act
		$result_a = $this->make_site_planner_config( $args )->get();
		$result_b = $this->make_site_planner_config( $args )->get();

		// Assert
		$this->assertEquals( $result_a['connectAuth']['signature'], $result_b['connectAuth']['signature'] );
	}

	/**
	 * Creates a partially-mocked Site_Planner_Config with controlled dependencies.
	 */
	private function make_site_planner_config( array $args ): Site_Planner_Config {
		$defaults = [
			'is_experiment_active'  => false,
			'has_common'            => false,
			'has_connect'           => false,
			'has_library_app'       => false,
			'is_connected'          => false,
			'access_token'          => '',
			'client_id'             => '',
			'site_key'              => '',
			'access_token_secret'   => '',
		];

		$args = array_merge( $defaults, $args );

		$library_app = null;

		if ( $args['has_library_app'] ) {
			$library_app = $this->createMock( \stdClass::class );

			// Re-create as anonymous class since Library has a complex constructor.
			$library_app = new class( $args ) {
				private array $args;

				public function __construct( array $args ) {
					$this->args = $args;
				}

				public function is_connected(): bool {
					return $this->args['is_connected'];
				}

				public function get( string $key ) {
					return $this->args[ $key ] ?? null;
				}

				public function get_site_key(): string {
					return $this->args['site_key'];
				}
			};
		}

		$connect = null;

		if ( $args['has_connect'] ) {
			$connect = new class( $library_app, $args['has_library_app'] ) {
				private $library_app;
				private bool $has_library_app;

				public function __construct( $library_app, bool $has_library_app ) {
					$this->library_app    = $library_app;
					$this->has_library_app = $has_library_app;
				}

				public function get_app( string $name ) {
					if ( 'library' === $name ) {
						return $this->has_library_app ? $this->library_app : null;
					}

					return null;
				}
			};
		}

		$common = null;

		if ( $args['has_common'] ) {
			$common = new class( $connect, $args['has_connect'] ) {
				private $connect;
				private bool $has_connect;

				public function __construct( $connect, bool $has_connect ) {
					$this->connect     = $connect;
					$this->has_connect = $has_connect;
				}

				public function get_component( string $name ) {
					if ( 'connect' === $name ) {
						return $this->has_connect ? $this->connect : null;
					}

					return null;
				}
			};
		}

		$is_active = $args['is_experiment_active'];

		return new class( $is_active, $common ) extends Site_Planner_Config {
			private bool $is_experiment_active;
			private $common;

			public function __construct( bool $is_experiment_active, $common ) {
				$this->is_experiment_active = $is_experiment_active;
				$this->common               = $common;
			}

			protected function is_experiment_active(): bool {
				return $this->is_experiment_active;
			}

			protected function get_common() {
				return $this->common;
			}
		};
	}
}
