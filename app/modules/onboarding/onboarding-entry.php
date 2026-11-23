<?php
namespace Elementor\App\Modules\Onboarding;

use Elementor\Core\Common\Modules\EventsManager\Module as Events_Manager;
use Elementor\Core\Upgrade\Manager as Upgrade_Manager;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * New-install onboarding reach (ED-26365).
 *
 * A/B/E: one forced setup entry on the first real admin visit within 14 days of activation.
 * C: partner already marked onboarded — do not redirect; offer a dismissible notice.
 * D: existing sites (plugin update, or logged-in reactivate) — no push.
 */
class Onboarding_Entry {

	const PENDING_OPTION = 'elementor_onboarding_pending';
	const ACTIVATED_AT_OPTION = 'elementor_onboarding_activated_at';
	const EVENT_QUEUE_OPTION = 'elementor_onboarding_redirect_event_queue';
	const TRACKED_REASONS_OPTION = 'elementor_onboarding_redirect_event_reasons';
	const EVENT_NAME = 'core_onboarding_redirect_decision';
	const ELIGIBILITY_WINDOW = 14 * DAY_IN_SECONDS;

	const DECISION_REDIRECT = 'redirect';
	const DECISION_NOTICE = 'notice';
	const DECISION_SKIP = 'skip';

	const REASON_REDIRECTED = 'redirected';
	const REASON_ALREADY_LOGGED_IN = 'already_logged_in';
	const REASON_EXPIRED = 'expired';
	const REASON_AJAX = 'ajax';
	const REASON_CLI_INSTALL = 'cli_install';
	const REASON_THIRD_PARTY_SKIP = 'third_party_skip';

	public static function get_url(): string {
		return admin_url( 'admin.php?page=elementor-app#onboarding' );
	}

	public static function mark_activation(): void {
		if ( self::should_skip_pending_for_existing_site() ) {
			self::track_decision( self::REASON_ALREADY_LOGGED_IN );

			return;
		}

		update_option( self::PENDING_OPTION, true );

		if ( ! get_option( self::ACTIVATED_AT_OPTION ) ) {
			update_option( self::ACTIVATED_AT_OPTION, time() );
		}
	}

	public static function clear_pending(): void {
		delete_option( self::PENDING_OPTION );
	}

	public static function is_pending(): bool {
		return (bool) get_option( self::PENDING_OPTION );
	}

	public static function is_within_eligibility_window(): bool {
		$activated_at = (int) get_option( self::ACTIVATED_AT_OPTION );

		if ( $activated_at <= 0 ) {
			return false;
		}

		return ( time() - $activated_at ) < self::ELIGIBILITY_WINDOW;
	}

	public static function has_finished_onboarding(): bool {
		return (bool) get_option( Module::ONBOARDING_OPTION );
	}

	public static function decide(): array {
		self::flush_event_queue();

		if ( ! self::is_pending() ) {
			return self::skip( '' );
		}

		// Do not burn the 14-day window on AJAX/REST/CLI/cron; delayed first login is still eligible (B).
		if ( wp_doing_ajax() ) {
			self::track_decision( self::REASON_AJAX );

			return self::skip( self::REASON_AJAX );
		}

		if ( self::is_rest_request() ) {
			return self::skip( '' );
		}

		if ( Utils::is_wp_cli() ) {
			self::track_decision( self::REASON_CLI_INSTALL );

			return self::skip( self::REASON_CLI_INSTALL );
		}

		if ( wp_doing_cron() ) {
			return self::skip( '' );
		}

		if ( self::is_admin_post_request() ) {
			return self::skip( '' );
		}

		if ( is_network_admin() || isset( $_GET['activate-multi'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			return self::skip( '' );
		}

		if ( ! current_user_can( 'manage_options' ) ) {
			return self::skip( '' );
		}

		if ( isset( $_GET['page'] ) && 'elementor-app' === $_GET['page'] ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			return self::skip( '' );
		}

		// Window is exclusive: day 13 still redirects; at 14 days we stop pushing setup.
		if ( ! self::is_within_eligibility_window() ) {
			self::clear_pending();
			self::track_decision( self::REASON_EXPIRED );

			return self::skip( self::REASON_EXPIRED );
		}

		// Partner skip: never force the wizard; keep an opt-in notice instead.
		if ( self::has_finished_onboarding() ) {
			self::track_decision( self::REASON_THIRD_PARTY_SKIP );

			return [
				'type' => self::DECISION_NOTICE,
				'reason' => self::REASON_THIRD_PARTY_SKIP,
			];
		}

		// One forced setup entry; later visits are not redirected.
		self::clear_pending();
		self::track_decision( self::REASON_REDIRECTED );

		return [
			'type' => self::DECISION_REDIRECT,
			'reason' => self::REASON_REDIRECTED,
		];
	}

	public static function should_show_partner_notice(): bool {
		return current_user_can( 'manage_options' )
			&& self::is_pending()
			&& self::is_within_eligibility_window()
			&& self::has_finished_onboarding();
	}

	public static function flush_event_queue(): void {
		$queue = get_option( self::EVENT_QUEUE_OPTION, [] );

		if ( empty( $queue ) || ! is_array( $queue ) ) {
			return;
		}

		if ( ! Events_Manager::can_send_events() ) {
			return;
		}

		foreach ( $queue as $item ) {
			if ( empty( $item['reason'] ) ) {
				continue;
			}

			self::dispatch_decision_event( $item['reason'] );
		}

		delete_option( self::EVENT_QUEUE_OPTION );
	}

	private static function should_skip_pending_for_existing_site(): bool {
		// Existing site (history from a prior install, or logged-in reactivate already onboarded).
		if ( ! empty( Upgrade_Manager::get_installs_history() ) ) {
			return true;
		}

		return (bool) get_current_user_id() && self::has_finished_onboarding();
	}

	private static function is_admin_post_request(): bool {
		global $pagenow;

		return isset( $pagenow ) && 'admin-post.php' === $pagenow;
	}

	private static function is_rest_request(): bool {
		if ( function_exists( 'wp_is_serving_rest_request' ) && wp_is_serving_rest_request() ) {
			return true;
		}

		return defined( 'REST_REQUEST' ) && REST_REQUEST;
	}

	private static function skip( string $reason ): array {
		return [
			'type' => self::DECISION_SKIP,
			'reason' => $reason,
		];
	}

	private static function track_decision( string $reason ): void {
		if ( self::was_reason_tracked( $reason ) ) {
			return;
		}

		if ( Events_Manager::can_send_events() ) {
			self::dispatch_decision_event( $reason );

			return;
		}

		$queue = get_option( self::EVENT_QUEUE_OPTION, [] );

		if ( ! is_array( $queue ) ) {
			$queue = [];
		}

		foreach ( $queue as $item ) {
			if ( ( $item['reason'] ?? '' ) === $reason ) {
				return;
			}
		}

		$queue[] = [ 'reason' => $reason ];
		update_option( self::EVENT_QUEUE_OPTION, $queue );
	}

	private static function dispatch_decision_event( string $reason ): void {
		if ( self::was_reason_tracked( $reason ) ) {
			return;
		}

		self::mark_reason_tracked( $reason );
		Events_Manager::dispatch_event( self::EVENT_NAME, [
			'reason' => $reason,
		] );
	}

	private static function was_reason_tracked( string $reason ): bool {
		$reasons = get_option( self::TRACKED_REASONS_OPTION, [] );

		return is_array( $reasons ) && in_array( $reason, $reasons, true );
	}

	private static function mark_reason_tracked( string $reason ): void {
		$reasons = get_option( self::TRACKED_REASONS_OPTION, [] );

		if ( ! is_array( $reasons ) ) {
			$reasons = [];
		}

		if ( in_array( $reason, $reasons, true ) ) {
			return;
		}

		$reasons[] = $reason;
		update_option( self::TRACKED_REASONS_OPTION, $reasons );
	}
}
