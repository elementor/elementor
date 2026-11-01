<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp\Preview;

use Elementor\Modules\Mcp\Preview\Site_Resource_Preview_Token;
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
class Test_Site_Resource_Preview_Token extends TestCase {

	const SECRET = 'site-resource-secret';

	public function test_encode__produces_dotted_token() {
		$token = Site_Resource_Preview_Token::encode( 10, 2000, self::SECRET );

		$this->assertCount( 2, explode( '.', $token ) );
	}

	public function test_decode__round_trips_post_id_and_expiry() {
		$token = Site_Resource_Preview_Token::encode( 10, 2000, self::SECRET );

		$this->assertSame(
			[
				'post_id' => 10,
				'expires_at' => 2000,
			],
			Site_Resource_Preview_Token::decode( $token, self::SECRET )
		);
	}

	public function test_decode__returns_null_when_post_id_tampered() {
		$token = Site_Resource_Preview_Token::encode( 10, 2000, self::SECRET );

		[ , $signature ] = explode( '.', $token );

		$bad_payload = rtrim( strtr( base64_encode( '{"p":99,"e":2000}' ), '+/', '-_' ), '=' );

		$this->assertNull( Site_Resource_Preview_Token::decode( $bad_payload . '.' . $signature, self::SECRET ) );
	}

	public function test_decode__returns_null_with_wrong_secret() {
		$token = Site_Resource_Preview_Token::encode( 10, 2000, self::SECRET );

		$this->assertNull( Site_Resource_Preview_Token::decode( $token, 'other-secret' ) );
	}

	public function test_is_expired__uses_greater_or_equal() {
		$claims = [ 'post_id' => 1, 'expires_at' => 5000 ];

		$this->assertFalse( Site_Resource_Preview_Token::is_expired( $claims, 4999 ) );
		$this->assertTrue( Site_Resource_Preview_Token::is_expired( $claims, 5000 ) );
	}
}
