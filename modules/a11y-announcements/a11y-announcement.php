<?php

namespace Elementor\Modules\A11yAnnouncements;

use Elementor\Core\Utils\Hints;
use Elementor\User;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class A11yAnnouncement {
	private const PLUGIN_SLUG = 'pojo-accessibility';
	private const PLUGIN_FILE_PATH = 'pojo-accessibility/pojo-accessibility.php';

	public function init() {
		add_action( 'elementor/editor/before_enqueue_scripts', [ $this, 'maybe_enqueue_announcement' ] );
		add_action( 'wp_ajax_elementor_set_a11y_announcement_dismissed', [ $this, 'ajax_dismiss_announcement' ] );
	}

	public function maybe_enqueue_announcement(): void {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		if ( $this->has_announcement_been_displayed() ) {
			return;
		}

		if ( $this->is_ally_active() ) {
			return;
		}

		$first_time = User::get_user_notice_first_time( 'ally' );
		if ( ! $first_time ) {
			User::set_user_notice_first_time( 'ally' );
			return;
		}

		if ( ! User::has_plugin_notice_been_displayed_for_required_time( 'ally', WEEK_IN_SECONDS ) ) {
			return;
		}

		$this->enqueue_scripts();
		$this->set_announcement_as_displayed();
	}

	private function is_ally_active(): bool {
		return Hints::is_plugin_active( self::PLUGIN_SLUG );
	}

	private function has_announcement_been_displayed(): bool {
		return (bool) get_user_meta( $this->get_current_user_id(), Module::ANNOUNCEMENT_DISPLAYED_OPTION, true );
	}

	private function set_announcement_as_displayed(): void {
		update_user_meta( $this->get_current_user_id(), Module::ANNOUNCEMENT_DISPLAYED_OPTION, true );
	}

	private function enqueue_scripts() {
		$min_suffix = Utils::is_script_debug() ? '' : '.min';

		wp_enqueue_style(
			Module::MODULE_NAME,
			ELEMENTOR_ASSETS_URL . 'css/modules/a11y-announcements/editor' . $min_suffix . '.css',
			[],
			ELEMENTOR_VERSION
		);

		wp_enqueue_script(
			Module::MODULE_NAME,
			ELEMENTOR_ASSETS_URL . 'js/a11y-announcements' . $min_suffix . '.js',
			[
				'react',
				'react-dom',
				'elementor-common',
				'elementor-v2-ui',
			],
			ELEMENTOR_VERSION,
			true
		);

		wp_localize_script(
			Module::MODULE_NAME,
			'elementorA11yAnnouncement',
			$this->prepare_data()
		);

		wp_set_script_translations( Module::MODULE_NAME, 'elementor' );
	}

	private function prepare_data() {
		$plugin_slug = self::PLUGIN_SLUG;
		$is_installed = Hints::is_plugin_installed( $plugin_slug );
		$is_active = Hints::is_plugin_active( $plugin_slug );

		$cta_text = esc_html__( 'Install Plugin', 'elementor' );
		$cta_url = '';

		if ( $is_active ) {
			return [];
		}

		if ( $is_installed ) {
			$cta_text = esc_html__( 'Activate Plugin', 'elementor' );
			$cta_url = wp_nonce_url(
				'plugins.php?action=activate&amp;plugin=' . self::PLUGIN_FILE_PATH . '&amp;plugin_status=all&amp;paged=1&amp;s',
				'activate-plugin_' . self::PLUGIN_FILE_PATH
			);
		} else {
			$cta_url = wp_nonce_url(
				self_admin_url( 'update.php?action=install-plugin&plugin=' . $plugin_slug ),
				'install-plugin_' . $plugin_slug
			);
		}

		return [
			'ctaText' => $cta_text,
			'ctaUrl' => $cta_url,
			'videoUrl' => 'https://www.youtube.com/embed/uj9TDcpC91I?start=1&loop=1&playlist=uj9TDcpC91I',
			'nonce' => wp_create_nonce( 'elementor_set_a11y_announcement_dismissed' ),
			'ajaxUrl' => admin_url( 'admin-ajax.php' ),
		];
	}

	public function ajax_dismiss_announcement() {
		check_ajax_referer( 'elementor_set_a11y_announcement_dismissed', 'nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( [ 'message' => esc_html__( 'You do not have permission to perform this action.', 'elementor' ) ] );
		}

		update_user_meta( $this->get_current_user_id(), Module::ANNOUNCEMENT_DISPLAYED_OPTION, true );

		wp_send_json_success();
	}

	private function get_current_user_id(): int {
		$current_user = wp_get_current_user();
		return $current_user->ID ?? 0;
	}
}
