<?php

namespace {
	if ( ! class_exists( 'WP_Error' ) ) {
		class WP_Error {
			public function __construct( $code = '', $message = '' ) {}
		}
	}

	if ( ! function_exists( 'add_filter' ) ) {
		function add_filter( $tag, $callback, $priority = 10, $accepted_args = 1 ) {
			$GLOBALS['_test_filters'][ $tag ][ $priority ][] = $callback;
			return true;
		}
	}

	if ( ! function_exists( 'remove_filter' ) ) {
		function remove_filter( $tag, $callback, $priority = 10 ) {
			if ( empty( $GLOBALS['_test_filters'][ $tag ][ $priority ] ) ) {
				return false;
			}

			$GLOBALS['_test_filters'][ $tag ][ $priority ] = array_values(
				array_filter(
					$GLOBALS['_test_filters'][ $tag ][ $priority ],
					fn( $registered ) => $registered !== $callback
				)
			);

			return true;
		}
	}

	if ( ! function_exists( 'apply_filters' ) ) {
		function apply_filters( $tag, $value, ...$args ) {
			if ( empty( $GLOBALS['_test_filters'][ $tag ] ) ) {
				return $value;
			}

			$priorities = array_keys( $GLOBALS['_test_filters'][ $tag ] );
			sort( $priorities, SORT_NUMERIC );

			foreach ( $priorities as $priority ) {
				foreach ( $GLOBALS['_test_filters'][ $tag ][ $priority ] as $callback ) {
					$value = $callback( $value, ...$args );
				}
			}

			return $value;
		}
	}

	if ( ! function_exists( 'get_option' ) ) {
		function get_option( $key, $default = false ) {
			return $GLOBALS['_test_options'][ $key ] ?? $default;
		}
	}

	if ( ! function_exists( 'update_option' ) ) {
		function update_option( $key, $value, $autoload = null ) {
			$GLOBALS['_test_options'][ $key ] = $value;
			return true;
		}
	}

	if ( ! function_exists( 'delete_option' ) ) {
		function delete_option( $key ) {
			unset( $GLOBALS['_test_options'][ $key ] );
			return true;
		}
	}

	if ( ! function_exists( 'current_time' ) ) {
		function current_time( $type ) {
			return time();
		}
	}

	if ( ! function_exists( 'wp_parse_url' ) ) {
		function wp_parse_url( $url, $component = -1 ) {
			return parse_url( $url, $component );
		}
	}

	if ( ! function_exists( 'esc_url' ) ) {
		function esc_url( $url ) {
			return htmlspecialchars( $url, ENT_QUOTES, 'UTF-8' );
		}
	}

	if ( ! function_exists( 'esc_url_raw' ) ) {
		function esc_url_raw( $url ) {
			return filter_var( $url, FILTER_SANITIZE_URL );
		}
	}

	if ( ! function_exists( 'wp_specialchars_decode' ) ) {
		function wp_specialchars_decode( $string ) {
			return htmlspecialchars_decode( $string, ENT_QUOTES );
		}
	}

	if ( ! function_exists( 'wp_json_encode' ) ) {
		function wp_json_encode( $data ) {
			return json_encode( $data );
		}
	}

	if ( ! function_exists( 'wp_http_validate_url' ) ) {
		function wp_http_validate_url( $url ) {
			if ( ! is_string( $url ) ) {
				return false;
			}

			return (bool) preg_match( '#^https://#', $url );
		}
	}

	if ( ! function_exists( 'is_wp_error' ) ) {
		function is_wp_error( $thing ) {
			return $thing instanceof \WP_Error;
		}
	}

	if ( ! function_exists( 'wp_safe_remote_get' ) ) {
		function wp_safe_remote_get( $url, $args = [] ) {
			$preempt = apply_filters( 'pre_http_request', false, $args, $url );

			if ( false !== $preempt && ! is_wp_error( $preempt ) ) {
				return $preempt;
			}

			return new \WP_Error( 'http_blocked', 'HTTP blocked in tests.' );
		}
	}

	if ( ! function_exists( 'wp_remote_retrieve_response_code' ) ) {
		function wp_remote_retrieve_response_code( $response ) {
			if ( is_wp_error( $response ) ) {
				return 0;
			}

			return (int) ( $response['response']['code'] ?? 0 );
		}
	}

	if ( ! function_exists( 'wp_remote_retrieve_body' ) ) {
		function wp_remote_retrieve_body( $response ) {
			if ( is_wp_error( $response ) ) {
				return '';
			}

			return $response['body'] ?? '';
		}
	}

	if ( ! defined( 'KB_IN_BYTES' ) ) {
		define( 'KB_IN_BYTES', 1024 );
	}

}

namespace Elementor\Tests\Phpunit\Elementor\Modules\Promotions {

use Elementor\Modules\Promotions\Promotion_Cdn_Url_Validator;
use Elementor\Modules\Promotions\Sticky_Panel_Promotion;
use Elementor\Modules\Promotions\Theme_Builder_Promotion;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Theme_Builder_And_Sticky_Panel_Promotion extends TestCase {

	private array $cdn_http_responses = [];

	protected function setUp(): void {
		$GLOBALS['_test_options'] = [];
		$GLOBALS['_test_filters'] = [];
		$this->cdn_http_responses = [];
		delete_option( Theme_Builder_Promotion::TRANSIENT_KEY );
		delete_option( Sticky_Panel_Promotion::TRANSIENT_KEY );
		add_filter( 'pre_http_request', [ $this, 'intercept_http_request' ], 10, 3 );
	}

	protected function tearDown(): void {
		remove_filter( 'pre_http_request', [ $this, 'intercept_http_request' ], 10 );
		delete_option( Theme_Builder_Promotion::TRANSIENT_KEY );
		delete_option( Sticky_Panel_Promotion::TRANSIENT_KEY );
	}

	public function intercept_http_request( $preempt, $args, $url ) {
		foreach ( $this->cdn_http_responses as $pattern => $body ) {
			if ( str_contains( $url, $pattern ) ) {
				return [
					'headers'  => [],
					'body'     => wp_json_encode( $body ),
					'response' => [ 'code' => 200 ],
				];
			}
		}

		return new \WP_Error( 'tests_blocked', 'HTTP blocked in tests.' );
	}

	private function mock_cdn_json( string $url_fragment, string $assets_key, array $payload ): void {
		$this->cdn_http_responses[ $url_fragment ] = [
			$assets_key => $payload,
		];
		delete_option( Theme_Builder_Promotion::TRANSIENT_KEY );
		delete_option( Sticky_Panel_Promotion::TRANSIENT_KEY );
	}

	private function sticky_defaults(): array {
		return [
			'url' => 'https://go.elementor.com/go-pro-sticky-widget-panel/',
			'message' => 'Access all Pro widgets.',
			'button_text' => 'Upgrade Now',
		];
	}

	public function test_theme_builder__default_when_cdn_inactive(): void {
		$config = Theme_Builder_Promotion::get_app_promotion_config();

		$this->assertSame( Theme_Builder_Promotion::DEFAULT_UPGRADE_URL, $config['upgrade_url'] );
		$this->assertArrayNotHasKey( 'button_text', $config );
	}

	public function test_theme_builder__cdn_url_and_button_when_active(): void {
		$this->mock_cdn_json(
			'theme-builder.json',
			'theme-builder',
			[
				'is_active'   => true,
				'url'         => 'https://go.elementor.com/test-theme-builder/',
				'button_text' => 'Sale — Upgrade',
			]
		);

		$config = Theme_Builder_Promotion::get_app_promotion_config();

		$this->assertSame( 'https://go.elementor.com/test-theme-builder/', $config['upgrade_url'] );
		$this->assertSame( 'Sale — Upgrade', $config['button_text'] );
	}

	public function test_theme_builder__preserves_ampersand_in_query_string(): void {
		$cdn_url = 'https://go.elementor.com/x/?a=1&b=2';
		$this->mock_cdn_json(
			'theme-builder.json',
			'theme-builder',
			[
				'is_active'   => true,
				'url'         => $cdn_url,
				'button_text' => 'Sale',
			]
		);

		$config = Theme_Builder_Promotion::get_app_promotion_config();

		$this->assertSame( $cdn_url, $config['upgrade_url'] );
	}

	public function test_theme_builder__rejects_invalid_cdn_url(): void {
		$this->mock_cdn_json(
			'theme-builder.json',
			'theme-builder',
			[
				'is_active'   => true,
				'url'         => 'https://example.com/evil/',
				'button_text' => 'Upgrade',
			]
		);

		$config = Theme_Builder_Promotion::get_app_promotion_config();

		$this->assertSame( Theme_Builder_Promotion::DEFAULT_UPGRADE_URL, $config['upgrade_url'] );
	}

	public function test_theme_builder__rejects_http_url(): void {
		$this->mock_cdn_json(
			'theme-builder.json',
			'theme-builder',
			[
				'is_active'   => true,
				'url'         => 'http://go.elementor.com/insecure/',
				'button_text' => 'Upgrade',
			]
		);

		$config = Theme_Builder_Promotion::get_app_promotion_config();

		$this->assertSame( Theme_Builder_Promotion::DEFAULT_UPGRADE_URL, $config['upgrade_url'] );
	}

	public function test_theme_builder__rejects_lookalike_host(): void {
		$this->mock_cdn_json(
			'theme-builder.json',
			'theme-builder',
			[
				'is_active'   => true,
				'url'         => 'https://elementor.com.evil.com/phish/',
				'button_text' => 'Upgrade',
			]
		);

		$config = Theme_Builder_Promotion::get_app_promotion_config();

		$this->assertSame( Theme_Builder_Promotion::DEFAULT_UPGRADE_URL, $config['upgrade_url'] );
	}

	public function test_sticky_panel__unchanged_when_cdn_inactive(): void {
		$defaults = $this->sticky_defaults();

		$merged = Sticky_Panel_Promotion::merge_cdn_into_sticky_promotion( $defaults );

		$this->assertSame( $defaults, $merged );
	}

	public function test_sticky_panel__cdn_overrides_when_active(): void {
		$this->mock_cdn_json(
			'sticky-panel.json',
			'sticky-panel',
			[
				'is_active'   => true,
				'message'     => 'Sale message.',
				'button_text' => 'Grab Pro',
				'url'         => 'https://go.elementor.com/test-sticky/',
			]
		);

		$merged = Sticky_Panel_Promotion::merge_cdn_into_sticky_promotion( $this->sticky_defaults() );

		$this->assertSame( 'Sale message.', $merged['message'] );
		$this->assertSame( 'Grab Pro', $merged['button_text'] );
		$this->assertSame( 'https://go.elementor.com/test-sticky/', $merged['url'] );
	}

	public function test_sticky_panel__preserves_ampersand_in_query_string(): void {
		$cdn_url = 'https://go.elementor.com/sticky/?a=1&b=2';
		$this->mock_cdn_json(
			'sticky-panel.json',
			'sticky-panel',
			[
				'is_active'   => true,
				'message'     => 'Sale',
				'button_text' => 'Go',
				'url'         => $cdn_url,
			]
		);

		$merged = Sticky_Panel_Promotion::merge_cdn_into_sticky_promotion( $this->sticky_defaults() );

		$this->assertSame( $cdn_url, $merged['url'] );
	}

	public function test_sticky_panel__rejects_invalid_cdn_url(): void {
		$this->mock_cdn_json(
			'sticky-panel.json',
			'sticky-panel',
			[
				'is_active'   => true,
				'message'     => 'Sale message.',
				'button_text' => 'Grab Pro',
				'url'         => 'https://example.com/evil/',
			]
		);

		$merged = Sticky_Panel_Promotion::merge_cdn_into_sticky_promotion( $this->sticky_defaults() );

		$this->assertSame( 'https://go.elementor.com/go-pro-sticky-widget-panel/', $merged['url'] );
	}

	public function test_sticky_panel__active_with_empty_url_keeps_default_url(): void {
		$this->mock_cdn_json(
			'sticky-panel.json',
			'sticky-panel',
			[
				'is_active'   => true,
				'message'     => 'Sale only.',
				'button_text' => 'Grab Pro',
				'url'         => '',
			]
		);

		$merged = Sticky_Panel_Promotion::merge_cdn_into_sticky_promotion( $this->sticky_defaults() );

		$this->assertSame( 'Sale only.', $merged['message'] );
		$this->assertSame( 'https://go.elementor.com/go-pro-sticky-widget-panel/', $merged['url'] );
	}

	public function test_sticky_panel__ignores_non_string_cdn_fields(): void {
		$this->mock_cdn_json(
			'sticky-panel.json',
			'sticky-panel',
			[
				'is_active'   => true,
				'message'     => [ 'bad' ],
				'button_text' => (object) [],
				'url'         => [ 'https://go.elementor.com/evil/' ],
			]
		);

		$merged = Sticky_Panel_Promotion::merge_cdn_into_sticky_promotion( $this->sticky_defaults() );

		$this->assertSame( $this->sticky_defaults(), $merged );
	}

	public function test_sticky_panel__preserves_percent_encoded_query_in_url(): void {
		$cdn_url = 'https://go.elementor.com/sticky/?utm_content=a%2Fb';
		$this->mock_cdn_json(
			'sticky-panel.json',
			'sticky-panel',
			[
				'is_active'   => true,
				'message'     => 'Sale',
				'button_text' => 'Go',
				'url'         => $cdn_url,
			]
		);

		$merged = Sticky_Panel_Promotion::merge_cdn_into_sticky_promotion( $this->sticky_defaults() );

		$this->assertSame( $cdn_url, $merged['url'] );
	}

	public function test_promotion_cdn_url_validator__allows_go_subdomain_only(): void {
		$this->assertTrue( Promotion_Cdn_Url_Validator::is_allowed_promotion_url( 'https://go.elementor.com/path/' ) );
		$this->assertFalse( Promotion_Cdn_Url_Validator::is_allowed_promotion_url( 'https://assets.elementor.com/path/' ) );
	}

	public function test_sticky_panel__rejects_cdn_copy_with_underscore_template_markers(): void {
		$defaults = $this->sticky_defaults();

		$this->mock_cdn_json(
			'sticky-panel.json',
			'sticky-panel',
			[
				'is_active'   => true,
				'message'     => '{{{ alert(1) }}}',
				'button_text' => '{{ Upgrade }}',
				'url'         => 'https://go.elementor.com/test-sticky/',
			]
		);

		$merged = Sticky_Panel_Promotion::merge_cdn_into_sticky_promotion( $defaults );

		$this->assertSame( $defaults['message'], $merged['message'] );
		$this->assertSame( $defaults['button_text'], $merged['button_text'] );
		$this->assertSame( 'https://go.elementor.com/test-sticky/', $merged['url'] );
	}

	public function test_promotion_cdn_url_validator__sanitize_promotion_display_string(): void {
		$this->assertSame(
			'Sale ends soon.',
			Promotion_Cdn_Url_Validator::sanitize_promotion_display_string( '  Sale ends soon.  ' )
		);
		$this->assertSame( '', Promotion_Cdn_Url_Validator::sanitize_promotion_display_string( '{{ malicious }}' ) );
		$this->assertSame( '', Promotion_Cdn_Url_Validator::sanitize_promotion_display_string( '<# code #>' ) );
	}

	public function test_promotion_cdn_url_validator__rejects_url_with_userinfo_or_port(): void {
		$this->assertFalse(
			Promotion_Cdn_Url_Validator::is_allowed_promotion_url( 'https://user@go.elementor.com:8443/path/' )
		);
		$this->assertTrue(
			Promotion_Cdn_Url_Validator::is_allowed_promotion_url( 'https://GO.ELEMENTOR.COM/pro/' )
		);
	}

}

}
