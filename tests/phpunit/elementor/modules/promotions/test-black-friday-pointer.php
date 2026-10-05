<?php

namespace {
	if ( ! function_exists( 'esc_html' ) ) {
		function esc_html( $text ) {
			return htmlspecialchars( $text, ENT_QUOTES, 'UTF-8' );
		}
	}

	if ( ! function_exists( 'esc_attr' ) ) {
		function esc_attr( $text ) {
			return htmlspecialchars( $text, ENT_QUOTES, 'UTF-8' );
		}
	}

	if ( ! function_exists( 'esc_url' ) ) {
		function esc_url( $url ) {
			return filter_var( $url, FILTER_SANITIZE_URL );
		}
	}

	if ( ! function_exists( 'wp_parse_url' ) ) {
		function wp_parse_url( $url, $component = -1 ) {
			return parse_url( $url, $component );
		}
	}

	if ( ! function_exists( 'wp_json_encode' ) ) {
		function wp_json_encode( $data ) {
			return json_encode( $data );
		}
	}

	if ( ! function_exists( 'wp_kses' ) ) {
		function wp_kses( $content, $allowed ) {
			return $content;
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

	if ( ! function_exists( 'get_transient' ) ) {
		function get_transient( $key ) {
			return $GLOBALS['_test_transients'][ $key ] ?? false;
		}
	}

	if ( ! function_exists( 'set_transient' ) ) {
		function set_transient( $key, $value, $expiry = 0 ) {
			$GLOBALS['_test_transients'][ $key ] = $value;
			return true;
		}
	}

	if ( ! function_exists( 'delete_transient' ) ) {
		function delete_transient( $key ) {
			unset( $GLOBALS['_test_transients'][ $key ] );
			return true;
		}
	}

	if ( ! function_exists( 'current_user_can' ) ) {
		function current_user_can( $cap ) {
			return true;
		}
	}

	if ( ! function_exists( 'get_current_user_id' ) ) {
		function get_current_user_id() {
			return 1;
		}
	}

	if ( ! function_exists( 'is_rtl' ) ) {
		function is_rtl() {
			return false;
		}
	}

	if ( ! function_exists( 'wp_enqueue_script' ) ) {
		function wp_enqueue_script( $handle ) {}
	}

	if ( ! function_exists( 'wp_enqueue_style' ) ) {
		function wp_enqueue_style( $handle ) {}
	}

	if ( ! function_exists( 'add_action' ) ) {
		function add_action( ...$args ) {}
	}

	if ( ! function_exists( 'add_filter' ) ) {
		function add_filter( ...$args ) {}
	}

	if ( ! function_exists( 'current_time' ) ) {
		function current_time( $type ) {
			return time();
		}
	}

	if ( ! function_exists( 'wp_http_validate_url' ) ) {
		function wp_http_validate_url( $url ) {
			return false;
		}
	}

	if ( ! function_exists( 'sanitize_key' ) ) {
		function sanitize_key( $key ) {
			return preg_replace( '/[^a-z0-9_\-]/', '', strtolower( $key ) );
		}
	}

	if ( ! function_exists( '__' ) ) {
		function __( $text, $domain = 'default' ) {
			return $text;
		}
	}
}

namespace Elementor {
	if ( ! class_exists( '\Elementor\User' ) ) {
		class User {
			public static function get_introduction_meta( $key ) {
				return $GLOBALS['_test_introductions'][ $key ] ?? false;
			}
		}
	}

	if ( ! class_exists( '\Elementor\Utils' ) ) {
		class Utils {
			public static function has_pro() {
				return false;
			}
		}
	}
}

namespace Elementor\Tests\Phpunit\Elementor\Modules\Promotions {

	use Elementor\Modules\Promotions\Pointers\Black_Friday;
	use PHPUnit\Framework\TestCase;

	if ( ! defined( 'ABSPATH' ) ) {
		exit;
	}

	class Test_Black_Friday_Pointer extends TestCase {

		protected function setUp(): void {
			$GLOBALS['_test_options']       = [];
			$GLOBALS['_test_transients']    = [];
			$GLOBALS['_test_introductions'] = [];

			if ( function_exists( 'delete_option' ) ) {
				delete_option( Black_Friday::POINTER_TRANSIENT_KEY );
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
				delete_option( Black_Friday::POINTER_TRANSIENT_KEY );
			}
		}

		public function block_http_request( $preempt, $r, $url ) {
			return new \WP_Error( 'tests_blocked', 'HTTP blocked in tests.' );
		}

		private function seed_cdn_data( array $payload ): void {
			update_option( Black_Friday::POINTER_TRANSIENT_KEY, [
				'timeout' => PHP_INT_MAX,
				'value'   => json_encode( $payload ),
			] );
		}

		private function get_seen_today_transient_key(): string {
			return Black_Friday::SEEN_TODAY_KEY . '_' . get_current_user_id();
		}

		// --- should_display_notice tests (cheap: user cap + seen-today + has_pro) ---

		public function test_should_display_notice__returns_true_when_conditions_met() {
			// Arrange — current_user_can() mocked true, no seen-today transient, has_pro=false.

			// Act
			$result = Black_Friday::should_display_notice();

			// Assert
			$this->assertTrue( $result );
		}

		public function test_should_display_notice__returns_false_when_seen_today() {
			// Arrange — mark as already seen today.
			set_transient( $this->get_seen_today_transient_key(), time(), 3600 );

			// Act
			$result = Black_Friday::should_display_notice();

			// Assert
			$this->assertFalse( $result );
		}

		// --- enqueue_notice tests (CDN is_active gate + seen-today guard) ---

		public function test_enqueue_notice__does_not_burn_seen_today_when_cdn_inactive() {
			// Arrange — no CDN data, HTTP blocked → is_active missing → early return.
			$seen_key = $this->get_seen_today_transient_key();

			// Act
			ob_start();
			( new Black_Friday() )->enqueue_notice();
			ob_end_clean();

			// Assert
			$this->assertFalse( get_transient( $seen_key ) );
		}

		public function test_enqueue_notice__does_not_burn_seen_today_when_is_active_false() {
			// Arrange
			$this->seed_cdn_data( [
				'is_active' => false,
				'title'     => 'Black Friday Is On!',
				'cta_url'   => 'https://go.elementor.com/test/',
			] );

			$seen_key = $this->get_seen_today_transient_key();

			// Act
			ob_start();
			( new Black_Friday() )->enqueue_notice();
			ob_end_clean();

			// Assert
			$this->assertFalse( get_transient( $seen_key ) );
		}

		public function test_enqueue_notice__does_not_burn_seen_today_when_title_missing() {
			// Arrange — is_active true so should_display_notice passes,
			// but title is empty so enqueue_notice must return early.
			$this->seed_cdn_data( [
				'is_active' => true,
				'title'     => '',
				'cta_url'   => 'https://go.elementor.com/test/',
			] );

			$seen_key = $this->get_seen_today_transient_key();

			// Act
			ob_start();
			( new Black_Friday() )->enqueue_notice();
			ob_end_clean();

			// Assert — set_seen_today must NOT have been called.
			$this->assertFalse( get_transient( $seen_key ) );
		}

		public function test_enqueue_notice__does_not_burn_seen_today_when_cta_url_missing() {
			// Arrange
			$this->seed_cdn_data( [
				'is_active' => true,
				'title'     => 'Black Friday Is On!',
				'cta_url'   => '',
			] );

			$seen_key = $this->get_seen_today_transient_key();

			// Act
			ob_start();
			( new Black_Friday() )->enqueue_notice();
			ob_end_clean();

			// Assert
			$this->assertFalse( get_transient( $seen_key ) );
		}

		public function test_enqueue_notice__sets_seen_today_and_outputs_title_when_fully_configured() {
			// Arrange — full valid payload: is_active, title, cta_url all present.
			$this->seed_cdn_data( [
				'is_active' => true,
				'title'     => 'Black Friday Is On!',
				'cta_url'   => 'https://go.elementor.com/test/',
			] );

			$seen_key = $this->get_seen_today_transient_key();

			// Act
			ob_start();
			( new Black_Friday() )->enqueue_notice();
			$output = ob_get_clean();

			// Assert — seen-today transient must be set.
			$this->assertNotFalse( get_transient( $seen_key ) );

			// Assert — output must contain the title from the CDN payload.
			$this->assertStringContainsString( 'Black Friday Is On!', $output );
		}

		public function test_enqueue_notice__uses_per_campaign_dismiss_key() {
			// Arrange — campaign is active and already dismissed for this campaign ID.
			$this->seed_cdn_data( [
				'is_active'   => true,
				'title'       => 'Black Friday Is On!',
				'cta_url'     => 'https://go.elementor.com/test/',
				'campaign_id' => 'bfcm2026',
			] );

			// Simulate the user having dismissed this specific campaign.
			$GLOBALS['_test_introductions'][ Black_Friday::DISMISS_ACTION_KEY . '_bfcm2026' ] = true;

			$seen_key = $this->get_seen_today_transient_key();

			// Act
			ob_start();
			( new Black_Friday() )->enqueue_notice();
			ob_end_clean();

			// Assert — dismissed campaign must not set the seen-today transient.
			$this->assertFalse( get_transient( $seen_key ) );
		}

		public function test_enqueue_notice__does_not_treat_different_campaign_as_dismissed() {
			// Arrange — campaign_id 'bfcm2026' is active, but only 'bfcm2025' was dismissed.
			$this->seed_cdn_data( [
				'is_active'   => true,
				'title'       => 'Black Friday Is On!',
				'cta_url'     => 'https://go.elementor.com/test/',
				'campaign_id' => 'bfcm2026',
			] );

			// Only the previous year's campaign was dismissed.
			$GLOBALS['_test_introductions'][ Black_Friday::DISMISS_ACTION_KEY . '_bfcm2025' ] = true;

			$seen_key = $this->get_seen_today_transient_key();

			// Act
			ob_start();
			( new Black_Friday() )->enqueue_notice();
			ob_get_clean();

			// Assert — current campaign is NOT dismissed, so seen-today IS set.
			$this->assertNotFalse( get_transient( $seen_key ) );
		}
	}
}
