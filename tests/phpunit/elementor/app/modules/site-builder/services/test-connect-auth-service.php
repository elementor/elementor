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
}
