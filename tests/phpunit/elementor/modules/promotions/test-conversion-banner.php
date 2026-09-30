<?php

namespace {
	if ( ! function_exists( 'esc_html__' ) ) {
		function esc_html__( $text, $domain = 'default' ) {
			return esc_html( $text );
		}
	}

	if ( ! function_exists( 'add_action' ) ) {
		function add_action( ...$args ) {}
	}

	if ( ! function_exists( 'add_filter' ) ) {
		function add_filter( ...$args ) {}
	}

	if ( ! function_exists( 'apply_filters' ) ) {
		function apply_filters( $tag, $value, ...$args ) {
			return $value;
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

	if ( ! function_exists( 'current_time' ) ) {
		function current_time( $type ) {
			return time();
		}
	}

	if ( ! function_exists( 'wp_http_validate_url' ) ) {
		// Return false so EditorAssetsAPI never makes real HTTP calls in tests.
		function wp_http_validate_url( $url ) {
			return false;
		}
	}

	if ( ! function_exists( 'wp_json_encode' ) ) {
		function wp_json_encode( $data ) {
			return json_encode( $data );
		}
	}
}

namespace Elementor\Tests\Phpunit\Elementor\Modules\Promotions {

use Elementor\Modules\Promotions\Conversion_Banner;
use PHPUnit\Framework\TestCase;
use ReflectionMethod;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once dirname( __DIR__, 5 ) . '/includes/utils.php';

class Test_Conversion_Banner extends TestCase {

	protected function setUp(): void {
		$GLOBALS['_test_options'] = [];
	}

	public function test_get_banner_config__uses_elementor_branded_copy() {
		// Arrange — no CDN cache, HTTP calls blocked → falls back to default.
		$banner = new Conversion_Banner();
		$method = new ReflectionMethod( Conversion_Banner::class, 'get_banner_config' );
		$method->setAccessible( true );

		// Act
		$config = $method->invoke( $banner );

		// Assert
		$this->assertSame( 'Elevate your site with Elementor Pro', $config['title'] );
		$this->assertSame(
			'Access Elementor\'s Theme Builder, Dynamic Content, WooCommerce Builder, Popup Builder, 85+ Pro widgets and more when you upgrade to Pro',
			$config['text']
		);
		$this->assertSame( 'Upgrade now', $config['buttons'][0]['text'] );
		$this->assertSame( Conversion_Banner::UPGRADE_URL, $config['buttons'][0]['link'] );
	}

	public function test_get_banner_config__uses_cdn_data_when_active() {
		// Arrange — seed the WP option with active CDN data.
		$cdn_payload = [
			'is_active' => true,
			'title'     => 'Sale Is On!',
			'text'      => 'Save big.',
			'cta_text'  => 'View Deals',
			'cta_url'   => 'https://go.elementor.com/test/',
			'image_url' => '',
			'image_alt' => 'Sale',
		];

		$GLOBALS['_test_options'][ Conversion_Banner::CDN_BANNER_TRANSIENT_KEY ] = [
			'timeout' => PHP_INT_MAX,
			'value'   => json_encode( $cdn_payload ),
		];

		$banner = new Conversion_Banner();
		$method = new ReflectionMethod( Conversion_Banner::class, 'get_banner_config' );
		$method->setAccessible( true );

		// Act
		$config = $method->invoke( $banner );

		// Assert
		$this->assertSame( 'Sale Is On!', $config['title'] );
		$this->assertSame( 'https://go.elementor.com/test/', $config['buttons'][0]['link'] );
	}

	public function test_get_banner_config__falls_back_when_cdn_missing_required_fields() {
		// Arrange — CDN is active but missing title and cta_url.
		$cdn_payload = [
			'is_active' => true,
			'text'      => 'Some text.',
		];

		$GLOBALS['_test_options'][ Conversion_Banner::CDN_BANNER_TRANSIENT_KEY ] = [
			'timeout' => PHP_INT_MAX,
			'value'   => json_encode( $cdn_payload ),
		];

		$banner = new Conversion_Banner();
		$method = new ReflectionMethod( Conversion_Banner::class, 'get_banner_config' );
		$method->setAccessible( true );

		// Act
		$config = $method->invoke( $banner );

		// Assert — should fall back to default.
		$this->assertSame( 'Elevate your site with Elementor Pro', $config['title'] );
	}
}

}
