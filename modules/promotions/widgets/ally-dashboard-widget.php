<?php

namespace Elementor\Modules\Promotions\Widgets;

use Elementor\Core\Utils\Hints;
use Elementor\Modules\Promotions\Module;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Ally_Dashboard_Widget {
	public const ALLY_SCANNER_RUN = 'ea11y_dashboard_widget_scanner_run';
	public const ALLY_NONCE_KEY = 'ea11y_dashboard_widget_nonce';
	public const ALLY_PUBLIC_URL = 'https://wordpress.org/plugins/pojo-accessibility/';

	/**
	 * Check is widget already submitted
	 *
	 * @access public
	 */
	public static function is_scanner_run() {
		return get_option( self::ALLY_SCANNER_RUN );
	}

	/**
	 * Displays the Elementor Ally dashboard widget.
	 *
	 * @access public
	 */
	public static function ally_widget_render(): void {
		$is_scanner_run = self::is_scanner_run();
		$submit_id = $is_scanner_run ? 'e-dashboard-ally-submitted' : 'e-dashboard-ally-submit';
		$link = $is_scanner_run ? self::ALLY_PUBLIC_URL : Module::get_ally_external_scanner_url() . '?url=' . home_url();
		?>
		<div class="e-dashboard-ally e-dashboard-widget">
			<div class="e-dashboard-ally-img">
				<svg width="151" height="151" viewBox="0 0 151 151" fill="none">
					<path d="M76.1725 1.00457C117.143 1.55928 149.912 35.2226 149.363 76.1937C148.814 117.165 115.156 149.929 74.1846 149.374C33.2136 148.819 0.445007 115.156 0.993951 74.1849C1.54289 33.2138 35.2015 0.449866 76.1725 1.00457ZM74.3834 134.537C107.16 134.981 134.087 108.77 134.526 75.9928C134.965 43.2159 108.751 16.2853 75.9737 15.8415C43.1969 15.3977 16.27 41.6089 15.8309 74.3858C15.3917 107.163 41.6066 134.093 74.3834 134.537Z" fill="black" fill-opacity="0.12"/>
					<path fill-rule="evenodd" clip-rule="evenodd" d="M75.0737 61.5437C75.6982 61.5855 76.3058 61.7729 76.8471 62.092C77.4593 62.4529 77.9646 62.9701 78.312 63.5898L88.6938 81.5006L88.7609 81.6391C89.0068 82.247 89.1008 82.9071 89.0337 83.5595C88.9664 84.2118 88.7401 84.8393 88.3754 85.3843C88.0107 85.9289 87.5175 86.3771 86.9405 86.6879C86.3633 86.9985 85.7182 87.1629 85.0628 87.1676L85.0543 87.1691H64.5848C64.5581 87.169 64.5311 87.1667 64.5049 87.1648C64.497 87.1654 64.4885 87.1672 64.4806 87.1676L64.3678 87.1662L64.1279 87.1477C63.5724 87.0855 63.0346 86.9075 62.5501 86.6251C61.9962 86.3021 61.5266 85.851 61.1823 85.31C60.8383 84.7694 60.6293 84.1534 60.5712 83.5152C60.5133 82.8768 60.6085 82.2316 60.8496 81.6376L60.9167 81.5006L71.2971 63.5898C71.6444 62.9704 72.1516 62.4529 72.7635 62.092C73.3819 61.7275 74.0874 61.5338 74.8053 61.5337L75.0737 61.5437ZM74.821 80.2226C74.0135 80.2226 73.3589 80.8773 73.3589 81.6848C73.3589 82.4923 74.0135 83.1469 74.821 83.1469H74.8353L74.9852 83.1397C75.7221 83.0645 76.2974 82.4415 76.2974 81.6848C76.2974 80.928 75.7221 80.305 74.9852 80.2298L74.8353 80.2226H74.821ZM74.8195 68.8928C74.2143 68.8932 73.723 69.384 73.723 69.9893V77.2999C73.7237 77.9045 74.2148 78.396 74.8195 78.3964C75.4246 78.3964 75.9154 77.9048 75.9161 77.2999V69.9893C75.9161 69.3838 75.4251 68.8928 74.8195 68.8928Z" fill="#DC2626"/>
				</svg>
			</div>
			<div class="e-dashboard-ally-info">
				<h4 class="e-dashboard-ally-title">
					<?php $is_scanner_run
						? esc_html_e( "Don't leave accessibility issues unresolved", 'elementor' )
						: esc_html_e( 'Accessibility check recommended', 'elementor' ); ?>
				</h4>
				<p class="e-dashboard-ally-description">
					<?php $is_scanner_run
						? esc_html_e( 'Install Ally for free to fix accessibility issues directly in WordPress.', 'elementor' )
						: esc_html_e( 'Most sites have accessibility gaps. Run a free scan to see how yours performs.', 'elementor' ) ?>
				</p>
				<a href="<?php echo esc_url( $link ); ?>" target="_blank" rel="noreferrer" id="<?php echo esc_attr( $submit_id ); ?>" class="button button-primary">
					<?php $is_scanner_run
						? esc_html_e( 'Get it free', 'elementor' )
						: esc_html_e( 'Run free scan', 'elementor' ); ?>
				</a>
			</div>
			<script>
				jQuery(function($) {
					$("#e-dashboard-ally-submit").on("click", function() {
						$.post(ajaxurl, {
							action: "e-ally-scanner-run",
							nonce: "<?php echo esc_html( wp_create_nonce( self::ALLY_NONCE_KEY ) ); ?>"
						});
					});
				});
			</script>
		</div>
	<?php }

	/**
	 * Ajax action handler
	 *
	 * @access public
	 */
	public function handle_click() {
		check_ajax_referer( self::ALLY_NONCE_KEY, 'nonce' );
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( 'Insufficient permissions' );
		}
		update_option( self::ALLY_SCANNER_RUN, true );
		wp_send_json_success();
	}

	/**
	 * Add widget to the list
	 *
	 * @access public
	 */
	public static function register_ally_dashboard_widgets() {
		add_meta_box(
			'e-dashboard-ally',
			'<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
					<path fill-rule="evenodd" clip-rule="evenodd" d="M1.6853 15.5557C0.586489 13.9112 0 11.9778 0 10C0 7.34785 1.05357 4.8043 2.92893 2.92893C4.8043 1.05357 7.34785 0 10 0C11.9778 0 13.9112 0.586489 15.5557 1.6853C17.2002 2.78412 18.4819 4.3459 19.2388 6.17316C19.9957 8.00042 20.1937 10.0111 19.8078 11.9509C19.422 13.8907 18.4696 15.6725 17.0711 17.0711C15.6725 18.4696 13.8907 19.422 11.9509 19.8078C10.0111 20.1937 8.00042 19.9957 6.17316 19.2388C4.3459 18.4819 2.78412 17.2002 1.6853 15.5557ZM7.50039 5.83301H5.83398V14.1666H7.50039V5.83301ZM14.166 5.83301H9.16683V7.49941H14.166V5.83301ZM14.166 9.16585H9.16683V10.8323H14.166V9.16585ZM14.166 12.5002H9.16683V14.1666H14.166V12.5002Z" fill="#0C0D0E"/>
				</svg>' . esc_html__( 'Accessibility', 'elementor' ),
			[ self::class, 'ally_widget_render' ],
			'dashboard',
			'column3',
			'high'
		);
	}

	public static function init(): void {
		if ( ! Hints::is_plugin_active( 'pojo-accessibility' ) ) {
			// Register action
			add_action( 'wp_ajax_e-ally-scanner-run', [ self::class, 'handle_click' ] );
			// Register Dashboard Widgets.
			add_action( 'wp_dashboard_setup', [ self::class, 'register_ally_dashboard_widgets' ], 99 );
		}
	}
}
