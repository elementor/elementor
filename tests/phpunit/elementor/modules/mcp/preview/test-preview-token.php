<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp\Preview;

use Elementor\Modules\Mcp\Preview\Preview_Token;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ );
}

if ( ! function_exists( __NAMESPACE__ . '\\wp_json_encode' ) ) {
	function wp_json_encode( $data ) {
		return json_encode( $data );
	}
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Preview_Token extends TestCase {

	const SECRET = 'test-secret';

	public function test_encode__produces_dotted_token() {
		$token = Preview_Token::encode( 42, 43, 1000, self::SECRET );

		$this->assertCount( 2, explode( '.', $token ) );
	}

	public function test_decode__round_trips_claims() {
		$token = Preview_Token::encode( 42, 43, 1000, self::SECRET );

		$claims = Preview_Token::decode( $token, self::SECRET );

		$this->assertSame( [
			'post_id' => 42,
			'revision_id' => 43,
			'expires_at' => 1000,
		], $claims );
	}

	public function test_decode__returns_null_when_signature_tampered() {
		$token = Preview_Token::encode( 42, 43, 1000, self::SECRET );

		$tampered = $token . 'x';

		$this->assertNull( Preview_Token::decode( $tampered, self::SECRET ) );
	}

	public function test_decode__returns_null_when_payload_tampered() {
		$token = Preview_Token::encode( 42, 43, 1000, self::SECRET );

		[ , $signature ] = explode( '.', $token );

		$bad_payload = rtrim( strtr( base64_encode( '{"p":9,"r":9,"e":1000}' ), '+/', '-_' ), '=' );

		$this->assertNull( Preview_Token::decode( $bad_payload . '.' . $signature, self::SECRET ) );
	}

	public function test_decode__returns_null_with_wrong_secret() {
		$token = Preview_Token::encode( 42, 43, 1000, self::SECRET );

		$this->assertNull( Preview_Token::decode( $token, 'other-secret' ) );
	}

	public function test_decode__returns_null_for_malformed_input() {
		$this->assertNull( Preview_Token::decode( 'not-a-token', self::SECRET ) );
		$this->assertNull( Preview_Token::decode( 'no-dot-here', self::SECRET ) );
		$this->assertNull( Preview_Token::decode( '', self::SECRET ) );
	}

	public function test_is_expired__uses_greater_or_equal() {
		$claims = [ 'post_id' => 1, 'revision_id' => 2, 'expires_at' => 1000 ];

		$this->assertFalse( Preview_Token::is_expired( $claims, 999 ) );
		$this->assertTrue( Preview_Token::is_expired( $claims, 1000 ) );
		$this->assertTrue( Preview_Token::is_expired( $claims, 1001 ) );
	}
}
