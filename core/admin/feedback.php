<?php
namespace Elementor\Core\Admin;

use Elementor\Api;
use Elementor\Core\Base\Module;
use Elementor\Tracker;
use Elementor\User;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Feedback extends Module {

	public function __construct() {
		add_action( 'current_screen', function () {
			if ( ! $this->is_plugins_screen() ) {
				return;
			}

			add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_feedback_dialog_scripts' ] );

			add_filter( 'elementor/admin/localize_settings', [ $this, 'localize_feedback_dialog_settings' ] );
		} );

		// Ajax.
		add_action( 'wp_ajax_elementor_deactivate_feedback', [ $this, 'ajax_elementor_deactivate_feedback' ] );

		// Review Plugin
		add_action( 'admin_notices', [ $this, 'admin_notices' ], 20 );
	}

	/**
	 * Get module name.
	 *
	 * Retrieve the module name.
	 *
	 * @since  1.7.0
	 * @access public
	 *
	 * @return string Module name.
	 */
	public function get_name() {
		return 'feedback';
	}

	/**
	 * Enqueue feedback dialog scripts.
	 *
	 * Registers the feedback dialog scripts and enqueues them.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function enqueue_feedback_dialog_scripts() {
		add_action( 'admin_footer', [ $this, 'print_deactivate_feedback_dialog' ] );

		$suffix = defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ? '' : '.min';

		wp_register_script(
			'elementor-admin-feedback',
			ELEMENTOR_ASSETS_URL . 'js/admin-feedback' . $suffix . '.js',
			[
				'elementor-common',
			],
			ELEMENTOR_VERSION,
			true
		);

		wp_enqueue_script( 'elementor-admin-feedback' );
	}

	public function localize_feedback_dialog_settings( $localized_settings ) {
		$localized_settings['i18n']['submit_n_deactivate'] = __( 'Submit & Deactivate', 'elementor' );
		$localized_settings['i18n']['skip_n_deactivate'] = __( 'Skip & Deactivate', 'elementor' );

		return $localized_settings;
	}

	/**
	 * Print deactivate feedback dialog.
	 *
	 * Display a dialog box to ask the user why he deactivated Elementor.
	 *
	 * Fired by `admin_footer` filter.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function print_deactivate_feedback_dialog() {
		$deactivate_reasons = [
			'no_longer_needed' => [
				'title' => __( 'I no longer need the plugin', 'elementor' ),
				'input_placeholder' => '',
			],
			'found_a_better_plugin' => [
				'title' => __( 'I found a better plugin', 'elementor' ),
				'input_placeholder' => __( 'Please share which plugin', 'elementor' ),
			],
			'couldnt_get_the_plugin_to_work' => [
				'title' => __( 'I couldn\'t get the plugin to work', 'elementor' ),
				'input_placeholder' => '',
			],
			'temporary_deactivation' => [
				'title' => __( 'It\'s a temporary deactivation', 'elementor' ),
				'input_placeholder' => '',
			],
			'elementor_pro' => [
				'title' => __( 'I have Elementor Pro', 'elementor' ),
				'input_placeholder' => '',
				'alert' => __( 'Wait! Don\'t deactivate Elementor. You have to activate both Elementor and Elementor Pro in order for the plugin to work.', 'elementor' ),
			],
			'other' => [
				'title' => __( 'Other', 'elementor' ),
				'input_placeholder' => __( 'Please share the reason', 'elementor' ),
			],
		];

		?>
		<div id="elementor-deactivate-feedback-dialog-wrapper">
			<div id="elementor-deactivate-feedback-dialog-header">
				<i class="eicon-elementor-square" aria-hidden="true"></i>
				<span id="elementor-deactivate-feedback-dialog-header-title"><?php echo __( 'Quick Feedback', 'elementor' ); ?></span>
			</div>
			<form id="elementor-deactivate-feedback-dialog-form" method="post">
				<?php
				wp_nonce_field( '_elementor_deactivate_feedback_nonce' );
				?>
				<input type="hidden" name="action" value="elementor_deactivate_feedback" />

				<div id="elementor-deactivate-feedback-dialog-form-caption"><?php echo __( 'If you have a moment, please share why you are deactivating Elementor:', 'elementor' ); ?></div>
				<div id="elementor-deactivate-feedback-dialog-form-body">
					<?php foreach ( $deactivate_reasons as $reason_key => $reason ) : ?>
						<div class="elementor-deactivate-feedback-dialog-input-wrapper">
							<input id="elementor-deactivate-feedback-<?php echo esc_attr( $reason_key ); ?>" class="elementor-deactivate-feedback-dialog-input" type="radio" name="reason_key" value="<?php echo esc_attr( $reason_key ); ?>" />
							<label for="elementor-deactivate-feedback-<?php echo esc_attr( $reason_key ); ?>" class="elementor-deactivate-feedback-dialog-label"><?php echo esc_html( $reason['title'] ); ?></label>
							<?php if ( ! empty( $reason['input_placeholder'] ) ) : ?>
								<input class="elementor-feedback-text" type="text" name="reason_<?php echo esc_attr( $reason_key ); ?>" placeholder="<?php echo esc_attr( $reason['input_placeholder'] ); ?>" />
							<?php endif; ?>
							<?php if ( ! empty( $reason['alert'] ) ) : ?>
								<div class="elementor-feedback-text"><?php echo esc_html( $reason['alert'] ); ?></div>
							<?php endif; ?>
						</div>
					<?php endforeach; ?>
				</div>
			</form>
		</div>
		<?php
	}

	/**
	 * Ajax elementor deactivate feedback.
	 *
	 * Send the user feedback when Elementor is deactivated.
	 *
	 * Fired by `wp_ajax_elementor_deactivate_feedback` action.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function ajax_elementor_deactivate_feedback() {
		if ( ! isset( $_POST['_wpnonce'] ) || ! wp_verify_nonce( $_POST['_wpnonce'], '_elementor_deactivate_feedback_nonce' ) ) {
			wp_send_json_error();
		}

		$reason_text = '';
		$reason_key = '';

		if ( ! empty( $_POST['reason_key'] ) ) {
			$reason_key = $_POST['reason_key'];
		}

		if ( ! empty( $_POST[ "reason_{$reason_key}" ] ) ) {
			$reason_text = $_POST[ "reason_{$reason_key}" ];
		}

		Api::send_feedback( $reason_key, $reason_text );

		wp_send_json_success();
	}

	public function admin_notices() {
		$notice_id = 'rate_us_feedback';

		if ( 'dashboard' !== get_current_screen()->id || User::is_user_notice_viewed( $notice_id ) || Tracker::is_notice_shown() ) {
			return;
		}

		$elementor_pages = new \WP_Query( [
			'post_type' => 'any',
			'post_status' => 'publish',
			'fields' => 'ids',
			'update_post_meta_cache' => false,
			'update_post_term_cache' => false,
			'meta_key' => '_elementor_edit_mode',
			'posts_per_page' => 11,
			'meta_value' => 'builder',
		] );

		if ( 10 >= $elementor_pages->post_count ) {
			return;
		}

		$dismiss_url = add_query_arg( [
			'action' => 'elementor_set_admin_notice_viewed',
			'notice_id' => esc_attr( $notice_id ),
		], admin_url( 'admin-post.php' ) );

		?>
		<div class="notice updated is-dismissible elementor-message elementor-message-dismissed" data-notice_id="<?php echo esc_attr( $notice_id ); ?>">
			<div class="elementor-message-inner">
				<div class="elementor-message-icon">
					<div class="e-logo-wrapper">
						<i class="eicon-elementor" aria-hidden="true"></i>
					</div>
				</div>
				<div class="elementor-message-content">
					<p><strong><?php echo __( 'Congrats!', 'elementor' ); ?></strong> <?php _e( 'You created over 10 pages with Elementor. Great job! If you can spare a minute, please help us by leaving a five star review on WordPress.org.', 'elementor' ); ?></p>
					<p class="elementor-message-actions">
						<a href="https://go.elementor.com/admin-review/" target="_blank" class="button button-primary"><?php _e( 'Happy To Help', 'elementor' ); ?></a>
						<a href="<?php echo esc_url_raw( $dismiss_url ); ?>" class="button elementor-button-notice-dismiss"><?php _e( 'Hide Notification', 'elementor' ); ?></a>
					</p>
				</div>
			</div>
		</div>
		<?php
	}

	protected function get_init_settings() {
		if ( ! $this->is_plugins_screen() ) {
			return [];
		}

		return [ 'is_tracker_opted_in' => Tracker::is_allow_track() ];
	}

	private function is_plugins_screen() {
		return in_array( get_current_screen()->id, [ 'plugins', 'plugins-network' ] );
	}
}
