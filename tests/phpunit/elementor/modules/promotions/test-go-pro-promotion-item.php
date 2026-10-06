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
use Elementor\Modules\Promotions\Module;
use PHPUnit\Framework\TestCase;
use ReflectionClass;
use ReflectionMethod;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once dirname( __DIR__, 5 ) . '/includes/utils.php';

class Test_Go_Pro_Promotion_Item extends TestCase {

	protected function setUp(): void {
		$GLOBALS['_test_options'] = [];

		// When running in the WP integration test context: clear the real DB option
		// and block outbound HTTP so EditorAssetsAPI cannot reach the live CDN.
		if ( function_exists( 'delete_option' ) ) {
			delete_option( Go_Pro_Promotion_Item::SIDE_MENU_TRANSIENT_KEY );
		}
		if ( function_exists( 'add_filter' ) ) {
			add_filter( 'pre_http_request', [ $this, 'block_http_request' ], 1, 3 );
		}
	}

	protected function tearDown(): void {
		if ( function_exists( 'remove_filter' ) ) {
			remove_filter( 'pre_http_request', [ $this, 'block_http_request' ], 1 );
		}
		if ( function_exists( 'delete_option' ) ) {
			delete_option( Go_Pro_Promotion_Item::SIDE_MENU_TRANSIENT_KEY );
		}
		unset( $GLOBALS['submenu']['elementor-home'] );
	}

	/**
	 * Used as the pre_http_request filter callback to block all HTTP in tests.
	 *
	 * @return \WP_Error
	 */
	public function block_http_request( $preempt, $r, $url ) {
		return new \WP_Error( 'tests_blocked', 'HTTP blocked in tests.' );
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

		update_option( Go_Pro_Promotion_Item::SIDE_MENU_TRANSIENT_KEY, [
			'timeout' => PHP_INT_MAX,
			'value'   => json_encode( $cdn_payload ),
		] );

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

		update_option( Go_Pro_Promotion_Item::SIDE_MENU_TRANSIENT_KEY, [
			'timeout' => PHP_INT_MAX,
			'value'   => json_encode( $cdn_payload ),
		] );

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

		update_option( Go_Pro_Promotion_Item::SIDE_MENU_TRANSIENT_KEY, [
			'timeout' => PHP_INT_MAX,
			'value'   => json_encode( $cdn_payload ),
		] );

		// Act
		$url = Go_Pro_Promotion_Item::get_url();

		// Assert
		$this->assertSame( $cdn_url, $url );
	}

	public function test_get_url__rejects_non_elementor_cdn_url() {
		// Arrange — CDN returns a URL outside elementor.com.
		$cdn_payload = [
			'is_active' => true,
			'label'     => 'Sale',
			'url'       => 'https://evil.example.com/steal/',
		];

		update_option( Go_Pro_Promotion_Item::SIDE_MENU_TRANSIENT_KEY, [
			'timeout' => PHP_INT_MAX,
			'value'   => json_encode( $cdn_payload ),
		] );

		// Act
		$url = Go_Pro_Promotion_Item::get_url();

		// Assert — domain filter must block non-elementor.com URL and fall back to default.
		$this->assertSame( Go_Pro_Promotion_Item::URL, $url );
	}

	// --- override_one_menu_upgrade_label_during_sale tests ---

	public function test_override_label__returns_menu_unchanged_when_cdn_inactive() {
		// Arrange — no CDN data seeded; HTTP blocked → assets_data will be empty.
		$original_label = 'Upgrade';
		$GLOBALS['submenu']['elementor-home'] = [
			1 => [ $original_label, 'manage_options', 'elementor-one-upgrade', $original_label ],
		];

		// Act
		$this->make_module()->override_one_menu_upgrade_label_during_sale( [] );

		// Assert — submenu label must not have changed when CDN is inactive.
		$this->assertSame( $original_label, $GLOBALS['submenu']['elementor-home'][1][0] );
	}

	public function test_override_label__returns_menu_unchanged_when_submenu_not_set() {
		// Arrange — CDN active but submenu['elementor-home'] not populated.
		$this->seed_side_menu_cdn_data( [
			'is_active' => true,
			'label'     => 'Sale!',
			'url'       => 'https://go.elementor.com/test/',
		] );

		unset( $GLOBALS['submenu']['elementor-home'] );

		// Act
		$this->make_module()->override_one_menu_upgrade_label_during_sale( [] );

		// Assert — submenu must not have been created by the function.
		$this->assertArrayNotHasKey( 'elementor-home', $GLOBALS['submenu'] ?? [] );
	}

	public function test_override_label__updates_upgrade_item_label_when_cdn_active() {
		// Arrange
		$this->seed_side_menu_cdn_data( [
			'is_active' => true,
			'label'     => 'Sale Now!',
			'url'       => 'https://go.elementor.com/test/',
		] );

		$GLOBALS['submenu']['elementor-home'] = [
			0 => [ 'Dashboard', 'manage_options', 'elementor-home', 'Dashboard' ],
			1 => [ 'Upgrade', 'manage_options', 'elementor-one-upgrade', 'Upgrade' ],
		];

		// Act
		$this->make_module()->override_one_menu_upgrade_label_during_sale( [] );

		// Assert — upgrade item's label must be replaced; other items must be untouched.
		$this->assertSame( 'Sale Now!', $GLOBALS['submenu']['elementor-home'][1][0] );
		$this->assertSame( 'Dashboard', $GLOBALS['submenu']['elementor-home'][0][0] );
	}

	public function test_override_label__does_not_modify_when_cdn_is_active_false() {
		// Arrange — payload present but is_active = false.
		$this->seed_side_menu_cdn_data( [
			'is_active' => false,
			'label'     => 'Sale Now!',
			'url'       => 'https://go.elementor.com/test/',
		] );

		$original_label = 'Upgrade';
		$GLOBALS['submenu']['elementor-home'] = [
			1 => [ $original_label, 'manage_options', 'elementor-one-upgrade', $original_label ],
		];

		// Act
		$this->make_module()->override_one_menu_upgrade_label_during_sale( [] );

		// Assert — label must not have changed.
		$this->assertSame( $original_label, $GLOBALS['submenu']['elementor-home'][1][0] );
	}

	private function make_module(): Module {
		return ( new ReflectionClass( Module::class ) )->newInstanceWithoutConstructor();
	}

	private function seed_side_menu_cdn_data( array $payload ): void {
		update_option( Go_Pro_Promotion_Item::SIDE_MENU_TRANSIENT_KEY, [
			'timeout' => PHP_INT_MAX,
			'value'   => json_encode( $payload ),
		] );
	}
}

}
