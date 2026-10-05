<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Promotions;

use Elementor\Modules\Promotions\Pointers\Promotional_Pointer;
use Elementor\User;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Promotional_Pointer extends Elementor_Test_Base {

	public function setUp(): void {
		parent::setUp();

		$this->act_as_admin();

		delete_option( Promotional_Pointer::POINTER_TRANSIENT_KEY );
		delete_transient( $this->get_seen_today_transient_key() );

		add_filter( 'pre_http_request', [ $this, 'block_http_request' ], 1, 3 );
	}

	public function tearDown(): void {
		remove_filter( 'pre_http_request', [ $this, 'block_http_request' ], 1 );

		delete_option( Promotional_Pointer::POINTER_TRANSIENT_KEY );
		delete_transient( $this->get_seen_today_transient_key() );

		// Remove any introduction meta written during tests.
		delete_user_meta( get_current_user_id(), User::INTRODUCTION_KEY );

		parent::tearDown();
	}

	public function block_http_request( $preempt, $r, $url ) {
		return new \WP_Error( 'tests_blocked', 'HTTP blocked in tests.' );
	}

	private function seed_cdn_data( array $payload ): void {
		update_option( Promotional_Pointer::POINTER_TRANSIENT_KEY, [
			'timeout' => PHP_INT_MAX,
			'value'   => wp_json_encode( $payload ),
		] );
	}

	private function get_seen_today_transient_key(): string {
		return Promotional_Pointer::SEEN_TODAY_KEY . '_' . get_current_user_id();
	}

	// --- should_display_notice tests (cheap: user cap + seen-today + has_pro) ---

	public function test_should_display_notice__returns_true_when_conditions_met() {
		// Arrange — act_as_admin() gives manage_options, no seen-today transient, no Pro.

		// Act
		$result = Promotional_Pointer::should_display_notice();

		// Assert
		$this->assertTrue( $result );
	}

	public function test_should_display_notice__returns_false_when_seen_today() {
		// Arrange — mark as already seen today.
		set_transient( $this->get_seen_today_transient_key(), time(), 3600 );

		// Act
		$result = Promotional_Pointer::should_display_notice();

		// Assert
		$this->assertFalse( $result );
	}

	// --- enqueue_notice tests (CDN is_active gate + seen-today guard) ---

	public function test_enqueue_notice__does_not_burn_seen_today_when_cdn_inactive() {
		// Arrange — no CDN data, HTTP blocked → is_active missing → early return.
		$seen_key = $this->get_seen_today_transient_key();

		// Act
		ob_start();
		( new Promotional_Pointer() )->enqueue_notice();
		ob_end_clean();

		// Assert
		$this->assertFalse( get_transient( $seen_key ) );
	}

	public function test_enqueue_notice__does_not_burn_seen_today_when_is_active_false() {
		// Arrange
		$this->seed_cdn_data( [
			'is_active' => false,
			'title'     => 'Sale Is On!',
			'cta_url'   => 'https://go.elementor.com/test/',
		] );

		$seen_key = $this->get_seen_today_transient_key();

		// Act
		ob_start();
		( new Promotional_Pointer() )->enqueue_notice();
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
		( new Promotional_Pointer() )->enqueue_notice();
		ob_end_clean();

		// Assert — set_seen_today must NOT have been called.
		$this->assertFalse( get_transient( $seen_key ) );
	}

	public function test_enqueue_notice__does_not_burn_seen_today_when_cta_url_missing() {
		// Arrange
		$this->seed_cdn_data( [
			'is_active' => true,
			'title'     => 'Sale Is On!',
			'cta_url'   => '',
		] );

		$seen_key = $this->get_seen_today_transient_key();

		// Act
		ob_start();
		( new Promotional_Pointer() )->enqueue_notice();
		ob_end_clean();

		// Assert
		$this->assertFalse( get_transient( $seen_key ) );
	}

	public function test_enqueue_notice__sets_seen_today_and_outputs_title_when_fully_configured() {
		// Arrange — full valid payload: is_active, title, cta_url all present.
		$this->seed_cdn_data( [
			'is_active' => true,
			'title'     => 'Sale Is On!',
			'cta_url'   => 'https://go.elementor.com/test/',
		] );

		$seen_key = $this->get_seen_today_transient_key();

		// Act
		ob_start();
		( new Promotional_Pointer() )->enqueue_notice();
		$output = ob_get_clean();

		// Assert — seen-today transient must be set.
		$this->assertNotFalse( get_transient( $seen_key ) );

		// Assert — output must contain the title from the CDN payload.
		$this->assertStringContainsString( 'Sale Is On!', $output );
	}

	public function test_enqueue_notice__uses_per_campaign_dismiss_key() {
		// Arrange — campaign is active and already dismissed for this campaign ID.
		$this->seed_cdn_data( [
			'is_active'   => true,
			'title'       => 'Sale Is On!',
			'cta_url'     => 'https://go.elementor.com/test/',
			'campaign_id' => 'bfcm2026',
		] );

		// Simulate the user having dismissed this specific campaign.
		User::set_introduction_viewed( [ 'introductionKey' => Promotional_Pointer::DISMISS_ACTION_KEY . '_bfcm2026' ] );

		$seen_key = $this->get_seen_today_transient_key();

		// Act
		ob_start();
		( new Promotional_Pointer() )->enqueue_notice();
		ob_end_clean();

		// Assert — dismissed campaign must not set the seen-today transient.
		$this->assertFalse( get_transient( $seen_key ) );
	}

	public function test_enqueue_notice__does_not_treat_different_campaign_as_dismissed() {
		// Arrange — campaign_id 'bfcm2026' is active, but only 'bfcm2025' was dismissed.
		$this->seed_cdn_data( [
			'is_active'   => true,
			'title'       => 'Sale Is On!',
			'cta_url'     => 'https://go.elementor.com/test/',
			'campaign_id' => 'bfcm2026',
		] );

		// Only the previous year's campaign was dismissed.
		User::set_introduction_viewed( [ 'introductionKey' => Promotional_Pointer::DISMISS_ACTION_KEY . '_bfcm2025' ] );

		$seen_key = $this->get_seen_today_transient_key();

		// Act
		ob_start();
		( new Promotional_Pointer() )->enqueue_notice();
		ob_get_clean();

		// Assert — current campaign is NOT dismissed, so seen-today IS set.
		$this->assertNotFalse( get_transient( $seen_key ) );
	}
}
