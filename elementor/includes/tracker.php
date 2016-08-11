<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Tracker {

	private static $_api_url = 'http://my.elementor.com/api/v1/tracker/';

	/**
	 * Hook into cron event.
	 */
	public static function init() {
		add_action( 'elementor/tracker/send_event', [ __CLASS__, 'send_tracking_data' ] );
		add_action( 'admin_init', [ __CLASS__, 'handle_tracker_actions' ] );
		add_action( 'admin_notices', [ __CLASS__, 'admin_notices' ] );
	}

	public static function check_for_settings_optin( $new_value ) {
		$old_value = get_option( 'elementor_allow_tracking', 'no' );
		if ( $old_value !== $new_value && 'yes' === $new_value ) {
			self::send_tracking_data( true );
		}

		if ( empty( $new_value ) ) {
			$new_value = 'no';
		}
		return $new_value;
	}

	/**
	 * Decide whether to send tracking data or not.
	 *
	 * @param bool $override
	 */
	public static function send_tracking_data( $override = false ) {
		// Don't trigger this on AJAX Requests
		if ( defined( 'DOING_AJAX' ) && DOING_AJAX ) {
			return;
		}

		if ( ! self::is_allow_track() ) {
			return;
		}

		if ( ! apply_filters( 'elementor/tracker/send_override', $override ) ) {
			// Send a maximum of once per week by default.
			$last_send = self::_get_last_send_time();
			if ( $last_send && $last_send > apply_filters( 'elementor/tracker/last_send_interval', strtotime( '-1 week' ) ) ) {
				return;
			}
		} else {
			// Make sure there is at least a 1 hour delay between override sends, we dont want duplicate calls due to double clicking links.
			$last_send = self::_get_last_send_time();
			if ( $last_send && $last_send > strtotime( '-1 hours' ) ) {
				return;
			}
		}

		// Update time first before sending to ensure it is set
		update_option( 'elementor_tracker_last_send', time() );

		// Send here..
		$params = [
			'system' => self::_get_system_reports_data(),
			'site_lang' => get_bloginfo( 'language' ),
			'email' => get_option( 'admin_email' ),
			'usages' => [],
		];

		add_filter( 'https_ssl_verify', '__return_false' );

		$response = wp_safe_remote_post(
			self::$_api_url,
			[
				'timeout' => 25,
				'blocking' => false,
				//'sslverify' => false,
				'body' => [
					'data' => wp_json_encode( $params ),
				],
			]
		);
	}

	public static function is_allow_track() {
		return 'yes' === get_option( 'elementor_allow_tracking', 'no' );
	}

	public static function handle_tracker_actions() {
		if ( ! isset( $_GET['elementor_tracker'] ) )
			return;

		if ( 'opt_into' === $_GET['elementor_tracker'] ) {
			check_admin_referer( 'opt_into' );

			update_option( 'elementor_allow_tracking', 'yes' );
			self::send_tracking_data( true );
		}

		if ( 'opt_out' === $_GET['elementor_tracker'] ) {
			check_admin_referer( 'opt_out' );

			update_option( 'elementor_allow_tracking', 'no' );
			update_option( 'elementor_tracker_notice', '1' );
		}

		wp_redirect( remove_query_arg( 'elementor_tracker' ) );
		exit;
	}

	public static function admin_notices() {
		// Show tracker notice after 12 hours from installed time.
		if ( self::_get_installed_time() > strtotime( '-12 hours' ) )
			return;

		if ( '1' === get_option( 'elementor_tracker_notice' ) )
			return;

		if ( self::is_allow_track() )
			return;

		if ( ! current_user_can( 'manage_options' ) )
			return;

		// TODO: Skip for development env
		$optin_url = wp_nonce_url( add_query_arg( 'elementor_tracker', 'opt_into' ), 'opt_into' );
		$optout_url = wp_nonce_url( add_query_arg( 'elementor_tracker', 'opt_out' ), 'opt_out' );
		?>
		<div class="updated">
			<p><?php _e( 'Love using Elementor? Become a super contributor by opting in to our anonymous plugin data collection and to our updates. We guarantee no sensitive data is collected.', 'elementor' ); ?></p>
			<p><a href="<?php echo $optin_url; ?>" class="button-primary"><?php _e( 'Sure! I\'d love to help', 'elementor' ); ?></a>&nbsp;<a href="<?php echo $optout_url; ?>" class="button-secondary"><?php _e( 'I won\'t help', 'elementor' ); ?></a></p>
		</div>
		<?php
	}

	private static function _get_installed_time() {
		$installed_time = get_option( '_elementor_installed_time' );
		if ( ! $installed_time ) {
			$installed_time = time();
			update_option( '_elementor_installed_time', $installed_time );
		}
		return $installed_time;
	}

	private static function _get_system_reports_data() {
		$reports = Plugin::instance()->system_info->load_reports( System_Info\Main::get_allowed_reports() );

		$system_reports = [];
		foreach ( $reports as $report_key => $report_details ) {
			$system_reports[ $report_key ] = [];
			foreach ( $report_details['report'] as $sub_report_key => $sub_report_details ) {
				$system_reports[ $report_key ][ $sub_report_key ] = $sub_report_details['value'];
			}
		}
		return $system_reports;
	}

	/**
	 * Get the last time tracking data was sent.
	 * @return int|bool
	 */
	private static function _get_last_send_time() {
		return apply_filters( 'elementor/tracker/last_send_time', get_option( 'elementor_tracker_last_send', false ) );
	}
}
Tracker::init();
