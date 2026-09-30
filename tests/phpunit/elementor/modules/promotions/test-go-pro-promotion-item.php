<?php

namespace {
	if ( ! function_exists( 'esc_html__' ) ) {
		function esc_html__( $text, $domain = 'default' ) {
			return esc_html( $text );
		}
	}

	if ( ! function_exists( 'esc_html' ) ) {
		function esc_html( $text ) {
			return htmlspecialchars( $text, ENT_QUOTES, 'UTF-8' );
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

use Elementor\Modules\Promotions\AdminMenuItems\Go_Pro_Promotion_Item;
use PHPUnit\Framework\TestCase;
use ReflectionMethod;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once dirname( __DIR__, 5 ) . '/includes/utils.php';

class Test_Go_Pro_Promotion_Item extends TestCase {

	protected function setUp(): void {
		$GLOBALS['_test_options'] = [];
	}

	public function test_get_label__returns_default_when_cdn_inactive() {
		// Arrange — no CDN cache, HTTP calls blocked → falls back to default.
		$item = new Go_Pro_Promotion_Item();

		// Act
		$label = $item->get_label();

		// Assert
		$this->assertSame( 'Upgrade', $label );
	}

	public function test_get_label__returns_cdn_label_when_active() {
		// Arrange — seed WP option with active CDN data.
		$cdn_payload = [
			'is_active' => true,
			'label'     => 'Upgrade Sale Now',
			'url'       => 'https://go.elementor.com/test/',
		];

		$GLOBALS['_test_options'][ Go_Pro_Promotion_Item::SIDE_MENU_TRANSIENT_KEY ] = [
			'timeout' => PHP_INT_MAX,
			'value'   => json_encode( $cdn_payload ),
		];

		$item = new Go_Pro_Promotion_Item();

		// Act
		$label = $item->get_label();

		// Assert
		$this->assertSame( 'Upgrade Sale Now', $label );
	}

	public function test_get_label__falls_back_when_cdn_active_but_label_empty() {
		// Arrange — CDN is active but label is empty.
		$cdn_payload = [
			'is_active' => true,
			'label'     => '',
			'url'       => 'https://go.elementor.com/test/',
		];

		$GLOBALS['_test_options'][ Go_Pro_Promotion_Item::SIDE_MENU_TRANSIENT_KEY ] = [
			'timeout' => PHP_INT_MAX,
			'value'   => json_encode( $cdn_payload ),
		];

		$item = new Go_Pro_Promotion_Item();

		// Act
		$label = $item->get_label();

		// Assert — should fall back to default.
		$this->assertSame( 'Upgrade', $label );
	}

	public function test_get_url__returns_default_when_cdn_inactive() {
		// Arrange — no CDN cache.

		// Act
		$url = Go_Pro_Promotion_Item::get_url();

		// Assert — default URL (after filter/manager chain with no overrides).
		$this->assertSame( Go_Pro_Promotion_Item::URL, $url );
	}

	public function test_get_url__returns_cdn_url_when_active() {
		// Arrange — seed with active CDN data.
		$cdn_url     = 'https://go.elementor.com/test/';
		$cdn_payload = [
			'is_active' => true,
			'label'     => 'Upgrade Sale Now',
			'url'       => $cdn_url,
		];

		$GLOBALS['_test_options'][ Go_Pro_Promotion_Item::SIDE_MENU_TRANSIENT_KEY ] = [
			'timeout' => PHP_INT_MAX,
			'value'   => json_encode( $cdn_payload ),
		];

		// Act
		$url = Go_Pro_Promotion_Item::get_url();

		// Assert
		$this->assertSame( $cdn_url, $url );
	}
}

}
