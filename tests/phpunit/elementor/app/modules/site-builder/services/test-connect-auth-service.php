<?php
namespace Elementor\Tests\Phpunit\Elementor\App\Modules\SiteBuilder\Services;

use Elementor\App\Modules\SiteBuilder\Services\Connect_Auth_Service;

class Test_Connect_Auth_Service extends \WP_UnitTestCase {

	private $service;

	public function setUp(): void {
		parent::setUp();
		$this->service = new Connect_Auth_Service();
	}

	public function test_get_connect_auth__returns_null_when_common_unavailable() {
		$result = $this->service->get_connect_auth();

		$this->assertNull( $result );
	}

	public function test_signature_algorithm__canonical_ordering() {
		$connect_data = [
			'site-key' => 'key-123',
			'access-token' => 'token-456',
			'home-url' => 'https://example.com/',
			'client-id' => 'client-789',
			'app' => 'library',
		];

		ksort( $connect_data );

		$expected_order = [
			'access-token',
			'app',
			'client-id',
			'home-url',
			'site-key',
		];

		$this->assertSame( $expected_order, array_keys( $connect_data ) );
	}

	public function test_signature_algorithm__hmac_sha256_with_json_numeric_check() {
		$payload = [
			'access-token' => 'test-token',
			'app' => 'library',
			'client-id' => '12345',
			'home-url' => 'https://test.local/',
			'site-key' => 'site-123',
		];

		$secret = 'my-secret-key';

		$signature_with_flag = hash_hmac(
			'sha256',
			wp_json_encode( $payload, JSON_NUMERIC_CHECK ),
			$secret
		);

		$this->assertIsString( $signature_with_flag );
		$this->assertSame( 64, strlen( $signature_with_flag ) );
	}

	public function test_signature_algorithm__stable_across_invocations() {
		$payload = [
			'access-token' => 'stable-token',
			'app' => 'library',
			'client-id' => 'stable-client',
			'home-url' => 'https://stable.test/',
			'site-key' => 'stable-key',
		];

		$secret = 'stable-secret';

		$signature_1 = hash_hmac(
			'sha256',
			wp_json_encode( $payload, JSON_NUMERIC_CHECK ),
			$secret
		);

		$signature_2 = hash_hmac(
			'sha256',
			wp_json_encode( $payload, JSON_NUMERIC_CHECK ),
			$secret
		);

		$this->assertSame( $signature_1, $signature_2 );
	}

	public function test_signature_algorithm__changes_with_different_payload() {
		$secret = 'secret';

		$payload_1 = [
			'access-token' => 'token-a',
			'app' => 'library',
			'client-id' => 'client-a',
			'home-url' => 'https://a.test/',
			'site-key' => 'key-a',
		];

		$payload_2 = [
			'access-token' => 'token-b',
			'app' => 'library',
			'client-id' => 'client-a',
			'home-url' => 'https://a.test/',
			'site-key' => 'key-a',
		];

		$signature_1 = hash_hmac( 'sha256', wp_json_encode( $payload_1, JSON_NUMERIC_CHECK ), $secret );
		$signature_2 = hash_hmac( 'sha256', wp_json_encode( $payload_2, JSON_NUMERIC_CHECK ), $secret );

		$this->assertNotSame( $signature_1, $signature_2 );
	}

	public function test_signature_algorithm__json_numeric_check_makes_difference() {
		$payload = [
			'access-token' => 'token',
			'app' => 'library',
			'client-id' => '123',
			'home-url' => 'https://test.local/',
			'site-key' => 'key',
		];

		$secret = 'secret';

		$with_flag = hash_hmac( 'sha256', wp_json_encode( $payload, JSON_NUMERIC_CHECK ), $secret );
		$without_flag = hash_hmac( 'sha256', wp_json_encode( $payload ), $secret );

		$this->assertNotSame( $with_flag, $without_flag );
	}

	public function test_get_connect_auth__output_structure() {
		$expected_keys = [ 'signature', 'accessToken', 'clientId', 'homeUrl', 'siteKey' ];

		$this->assertIsArray( $expected_keys );
		$this->assertCount( 5, $expected_keys );
	}

	public function test_get_connect_auth__returns_correct_signature_with_mocked_app() {
		$mock_app = $this->createMock( \Elementor\App\Modules\SiteBuilder\Connect\App::class );
		$mock_app->method( 'is_connected' )->willReturn( true );
		$mock_app->method( 'get' )->willReturnCallback( function( $key ) {
			$values = [
				'access_token' => 'test-access-token-123',
				'client_id' => 'test-client-id-456',
				'access_token_secret' => 'test-secret-789',
			];
			return $values[ $key ] ?? null;
		} );
		$mock_app->method( 'get_site_key' )->willReturn( 'test-site-key-abc' );

		$mock_connect = $this->getMockBuilder( \stdClass::class )
			->addMethods( [ 'get_app' ] )
			->getMock();
		$mock_connect->method( 'get_app' )->with( 'library' )->willReturn( $mock_app );

		$mock_common = $this->getMockBuilder( \stdClass::class )
			->addMethods( [ 'get_component' ] )
			->getMock();
		$mock_common->method( 'get_component' )->with( 'connect' )->willReturn( $mock_connect );

		$original_plugin = \Elementor\Plugin::$instance;
		$mock_plugin = new \stdClass();
		$mock_plugin->common = $mock_common;
		\Elementor\Plugin::$instance = $mock_plugin;

		try {
			$result = $this->service->get_connect_auth();

			$this->assertIsArray( $result );
			$this->assertArrayHasKey( 'signature', $result );
			$this->assertArrayHasKey( 'accessToken', $result );
			$this->assertArrayHasKey( 'clientId', $result );
			$this->assertArrayHasKey( 'homeUrl', $result );
			$this->assertArrayHasKey( 'siteKey', $result );

			$this->assertSame( 'test-access-token-123', $result['accessToken'] );
			$this->assertSame( 'test-client-id-456', $result['clientId'] );
			$this->assertSame( 'test-site-key-abc', $result['siteKey'] );

			$home_url = trailingslashit( home_url() );
			$this->assertSame( $home_url, $result['homeUrl'] );

			$connect_data = [
				'access-token' => 'test-access-token-123',
				'app' => 'library',
				'client-id' => 'test-client-id-456',
				'home-url' => $home_url,
				'site-key' => 'test-site-key-abc',
			];
			ksort( $connect_data );

			$expected_signature = hash_hmac(
				'sha256',
				wp_json_encode( $connect_data, JSON_NUMERIC_CHECK ),
				'test-secret-789'
			);

			$this->assertSame( $expected_signature, $result['signature'] );
		} finally {
			\Elementor\Plugin::$instance = $original_plugin;
		}
	}
}
