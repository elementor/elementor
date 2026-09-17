<?php
namespace Elementor\Tests\Phpunit\Elementor\Includes;

use Elementor\Includes\EditorAssetsAPI;
use PHPUnit\Framework\TestCase as PHPUnit_TestCase;

class Test_Editor_Assets_API extends PHPUnit_TestCase {

	public function test_has_valid_nested_array_returns_true_when_empty_path_and_valid_non_empty_root() {
		$data = [ 'get_started' => [ 'repeater' => [ 'item' ] ] ];

		$this->assertTrue( EditorAssetsAPI::has_valid_nested_array( $data, [] ) );
	}

	public function test_has_valid_nested_array_returns_false_when_empty_path_and_empty_root() {
		$data = [];

		$this->assertFalse( EditorAssetsAPI::has_valid_nested_array( $data, [] ) );
	}

	public function test_has_valid_nested_array_returns_true_for_valid_single_key_path() {
		$data = [ 'get_started' => [ 'item1', 'item2' ] ];

		$this->assertTrue( EditorAssetsAPI::has_valid_nested_array( $data, [ 'get_started' ] ) );
	}

	public function test_has_valid_nested_array_returns_true_for_valid_multi_key_path() {
		$data = [
			'get_started' => [
				'repeater' => [
					[ 'title' => 'Site Settings' ],
					[ 'title' => 'Site Logo' ],
				],
			],
		];

		$this->assertTrue( EditorAssetsAPI::has_valid_nested_array( $data, [ 'get_started', 'repeater' ] ) );
	}

	public function test_has_valid_nested_array_returns_false_when_middle_key_missing() {
		$data = [ 'get_started' => [] ];

		$this->assertFalse( EditorAssetsAPI::has_valid_nested_array( $data, [ 'get_started', 'repeater' ] ) );
	}

	public function test_has_valid_nested_array_returns_false_when_final_value_not_array() {
		$data = [ 'get_started' => [ 'repeater' => 'not_an_array' ] ];

		$this->assertFalse( EditorAssetsAPI::has_valid_nested_array( $data, [ 'get_started', 'repeater' ] ) );
	}

	public function test_has_valid_nested_array_returns_false_when_empty_array() {
		$data = [ 'get_started' => [ 'repeater' => [] ] ];

		$this->assertFalse( EditorAssetsAPI::has_valid_nested_array( $data, [ 'get_started', 'repeater' ] ) );
	}

	/**
	 * @dataProvider provider_allowed_urls
	 */
	public function test_is_allowed_url__accepts_known_https_hosts( string $url ) {
		$this->assertTrue( EditorAssetsAPI::is_allowed_url( $url ), "should accept: {$url}" );
	}

	public function provider_allowed_urls(): array {
		return [
			'production root' => [ EditorAssetsAPI::PRODUCTION_URL . '/x.json' ],
			'production deep path' => [ EditorAssetsAPI::PRODUCTION_URL . '/10th-bday/v1/10th-bday.json' ],
			'staging' => [ EditorAssetsAPI::STAGING_URL . '/x.json' ],
			'dev' => [ EditorAssetsAPI::DEV_URL . '/x.json' ],
			'with query string' => [ EditorAssetsAPI::PRODUCTION_URL . '/x.json?v=1' ],
		];
	}

	/**
	 * @dataProvider provider_disallowed_urls
	 */
	public function test_is_allowed_url__rejects_unsafe_or_non_allowlisted_input( $url, string $reason ) {
		$this->assertFalse( EditorAssetsAPI::is_allowed_url( $url ), "should reject ({$reason}): " . var_export( $url, true ) );
	}

	public function provider_disallowed_urls(): array {
		return [
			'null' => [ null, 'non-string input' ],
			'integer' => [ 123, 'non-string input' ],
			'array' => [ [ 'https://assets.elementor.com' ], 'non-string input' ],
			'empty string' => [ '', 'empty string fails wp_http_validate_url' ],
			'malformed' => [ 'not a url', 'fails wp_http_validate_url' ],
			'no scheme' => [ 'assets.elementor.com/x.json', 'no scheme' ],
			'http on allowed host' => [ 'http://assets.elementor.com/x.json', 'http scheme rejected' ],
			'ftp on allowed host' => [ 'ftp://assets.elementor.com/x.json', 'non-https scheme' ],
			'unknown host' => [ 'https://attacker.example/x.json', 'host not allowlisted' ],
			'suffix attack' => [ 'https://assets.elementor.com.evil.tld/x.json', 'suffix-spoof rejected by strict equality' ],
			'subdomain' => [ 'https://cdn.assets.elementor.com/x.json', 'subdomain not in allowlist' ],
			'localhost' => [ 'https://localhost/x.json', 'host not allowlisted' ],
			'embedded credentials' => [ 'https://user:pass@assets.elementor.com/x.json', 'wp_http_validate_url rejects userinfo' ],
		];
	}

	public function test_do_safe_get_request__short_circuits_for_disallowed_url_without_http_call() {
		$called = false;
		$pre = function () use ( &$called ) {
			$called = true;
			return [ 'response' => [ 'code' => 200 ], 'body' => '{}' ];
		};

		add_filter( 'pre_http_request', $pre, 10, 0 );

		try {
			$result = EditorAssetsAPI::do_safe_get_request( 'https://attacker.example/x.json' );
		} finally {
			remove_filter( 'pre_http_request', $pre, 10 );
		}

		$this->assertNull( $result );
		$this->assertFalse( $called, 'wp_safe_remote_get must not be invoked for disallowed URLs' );
	}

	public function test_do_safe_get_request__returns_decoded_json_for_allowed_url() {
		$payload = [ 'foo' => 'bar', 'nested' => [ 'baz' => 1 ] ];
		$pre = fn() => [
			'response' => [ 'code' => 200 ],
			'body' => wp_json_encode( $payload ),
		];

		add_filter( 'pre_http_request', $pre );

		try {
			$result = EditorAssetsAPI::do_safe_get_request( EditorAssetsAPI::PRODUCTION_URL . '/x.json' );
		} finally {
			remove_filter( 'pre_http_request', $pre );
		}

		$this->assertSame( $payload, $result );
	}

	public function test_do_safe_get_request__returns_null_on_non_200_response() {
		$pre = fn() => [ 'response' => [ 'code' => 404 ], 'body' => '' ];

		add_filter( 'pre_http_request', $pre );

		try {
			$result = EditorAssetsAPI::do_safe_get_request( EditorAssetsAPI::PRODUCTION_URL . '/x.json' );
		} finally {
			remove_filter( 'pre_http_request', $pre );
		}

		$this->assertNull( $result );
	}

	public function test_do_safe_get_request__returns_null_on_invalid_json() {
		$pre = fn() => [ 'response' => [ 'code' => 200 ], 'body' => 'not-json' ];

		add_filter( 'pre_http_request', $pre );

		try {
			$result = EditorAssetsAPI::do_safe_get_request( EditorAssetsAPI::PRODUCTION_URL . '/x.json' );
		} finally {
			remove_filter( 'pre_http_request', $pre );
		}

		$this->assertNull( $result );
	}
}
