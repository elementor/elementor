<?php

namespace {
	if ( ! function_exists( 'add_filter' ) ) {
		function add_filter( ...$args ) {}
	}

	if ( ! function_exists( 'apply_filters' ) ) {
		function apply_filters( $tag, $value, ...$args ) {
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
			return filter_var( $url, FILTER_SANITIZE_URL );
		}
	}

	if ( ! function_exists( 'wp_http_validate_url' ) ) {
		function wp_http_validate_url( $url ) {
			return false;
		}
	}
}

namespace Elementor\Tests\Phpunit\Elementor\Modules\Promotions {

use Elementor\Modules\Promotions\Sticky_Panel_Promotion;
use Elementor\Modules\Promotions\Theme_Builder_Promotion;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once dirname( __DIR__, 5 ) . '/includes/utils.php';

class Test_Theme_Builder_And_Sticky_Panel_Promotion extends TestCase {

	protected function setUp(): void {
		$GLOBALS['_test_options'] = [];
		delete_option( Theme_Builder_Promotion::TRANSIENT_KEY );
		delete_option( Sticky_Panel_Promotion::TRANSIENT_KEY );
		if ( function_exists( 'add_filter' ) ) {
			add_filter( 'pre_http_request', [ $this, 'block_http_request' ], 1, 3 );
		}
	}

	protected function tearDown(): void {
		if ( function_exists( 'remove_filter' ) ) {
			remove_filter( 'pre_http_request', [ $this, 'block_http_request' ], 1 );
		}
		delete_option( Theme_Builder_Promotion::TRANSIENT_KEY );
		delete_option( Sticky_Panel_Promotion::TRANSIENT_KEY );
	}

	public function block_http_request( $preempt, $r, $url ) {
		return new \WP_Error( 'tests_blocked', 'HTTP blocked in tests.' );
	}

	private function seed_cdn_cache( string $option_key, array $payload ): void {
		update_option( $option_key, [
			'timeout' => PHP_INT_MAX,
			'value'   => wp_json_encode( $payload ),
		] );
	}

	public function test_theme_builder__default_when_cdn_inactive(): void {
		$config = Theme_Builder_Promotion::get_app_promotion_config();

		$this->assertSame( Theme_Builder_Promotion::DEFAULT_UPGRADE_URL, $config['upgrade_url'] );
		$this->assertArrayNotHasKey( 'button_text', $config );
	}

	public function test_theme_builder__cdn_url_and_button_when_active(): void {
		$this->seed_cdn_cache( Theme_Builder_Promotion::TRANSIENT_KEY, [
			'is_active'   => true,
			'url'         => 'https://go.elementor.com/test-theme-builder/',
			'button_text' => 'Sale — Upgrade',
		] );

		$config = Theme_Builder_Promotion::get_app_promotion_config();

		$this->assertSame( 'https://go.elementor.com/test-theme-builder/', $config['upgrade_url'] );
		$this->assertSame( 'Sale — Upgrade', $config['button_text'] );
	}

	public function test_theme_builder__rejects_invalid_cdn_url(): void {
		$this->seed_cdn_cache( Theme_Builder_Promotion::TRANSIENT_KEY, [
			'is_active'   => true,
			'url'         => 'https://example.com/evil/',
			'button_text' => 'Upgrade',
		] );

		$config = Theme_Builder_Promotion::get_app_promotion_config();

		$this->assertSame( Theme_Builder_Promotion::DEFAULT_UPGRADE_URL, $config['upgrade_url'] );
	}

	public function test_sticky_panel__unchanged_when_cdn_inactive(): void {
		$defaults = [
			'url' => 'https://go.elementor.com/go-pro-sticky-widget-panel/',
			'message' => 'Access all Pro widgets.',
			'button_text' => 'Upgrade Now',
		];

		$merged = Sticky_Panel_Promotion::apply_to_promotion( $defaults );

		$this->assertSame( $defaults, $merged );
	}

	public function test_sticky_panel__cdn_overrides_when_active(): void {
		$this->seed_cdn_cache( Sticky_Panel_Promotion::TRANSIENT_KEY, [
			'is_active'   => true,
			'message'     => 'Sale message.',
			'button_text' => 'Grab Pro',
			'url'         => 'https://go.elementor.com/test-sticky/',
		] );

		$defaults = [
			'url' => 'https://go.elementor.com/go-pro-sticky-widget-panel/',
			'message' => 'Access all Pro widgets.',
			'button_text' => 'Upgrade Now',
		];

		$merged = Sticky_Panel_Promotion::apply_to_promotion( $defaults );

		$this->assertSame( 'Sale message.', $merged['message'] );
		$this->assertSame( 'Grab Pro', $merged['button_text'] );
		$this->assertSame( 'https://go.elementor.com/test-sticky/', $merged['url'] );
	}
}

}
