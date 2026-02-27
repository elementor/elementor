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

	public function init() {
		add_action( 'elementor/editor/before_enqueue_scripts', [ $this, 'maybe_enqueue_announcement' ] );
		add_action( 'wp_ajax_elementor_set_a11y_announcement_dismissed', [ $this, 'ajax_dismiss_announcement' ] );
	}

	public function maybe_enqueue_announcement(): void {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		if ( $this->is_ally_active() ) {
			return;
		}

		if ( ! $this->has_ai_announcement_been_displayed() ) {
			return;
		}

		if ( $this->has_ally_announcement_been_displayed() ) {
			return;
		}

		$this->enqueue_scripts();
		$this->set_announcement_as_displayed();
	}

	private function is_ally_active(): bool {
		return Hints::is_plugin_active( self::PLUGIN_SLUG );
	}

	private function has_ai_announcement_been_displayed(): bool {
		return User::get_introduction_meta( 'ai-get-started-announcement' );
	}

	private function has_ally_announcement_been_displayed(): bool {
		return User::get_introduction_meta( Module::ANNOUNCEMENT_DISPLAYED_OPTION );
	}

	private function set_announcement_as_displayed(): void {
		User::set_introduction_viewed( [ 'introductionKey' => Module::ANNOUNCEMENT_DISPLAYED_OPTION ] );
	}

	private function enqueue_scripts() {
		$suffix = Utils::is_script_debug() ? '' : '.min';

		wp_enqueue_style(
			Module::MODULE_NAME,
			ELEMENTOR_ASSETS_URL . "css/modules/a11y-announcements/editor{$suffix}.css",
			[],
			ELEMENTOR_VERSION
		);

		wp_enqueue_script(
			Module::MODULE_NAME,
			ELEMENTOR_ASSETS_URL . "js/a11y-announcements{$suffix}.js",
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

		if ( Hints::is_plugin_active( $plugin_slug ) ) {
			return [];
		}

		return [
			'nonce' => wp_create_nonce( 'elementor_set_a11y_announcement_dismissed' ),
			'ajaxUrl' => admin_url( 'admin-ajax.php' ),
			'videoUrl' => 'https://www.youtube.com/embed/uj9TDcpC91I?start=1&loop=1&playlist=uj9TDcpC91I',
			'learnMoreText' => esc_html__( 'Learn more', 'elementor' ),
			'learnMoreUrl' => 'https://go.elementor.com/acc-editor-announcement-learn-more',
			'ctaText' => Hints::is_plugin_installed( $plugin_slug )
				? esc_html__( 'Activate Plugin', 'elementor' )
				: esc_html__( 'Install Plugin', 'elementor' ),
			'ctaUrl' => Hints::get_plugin_action_url( $plugin_slug ),
		];
	}

	public function ajax_dismiss_announcement() {
		check_ajax_referer( 'elementor_set_a11y_announcement_dismissed', 'nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( [ 'message' => esc_html__( 'You do not have permission to perform this action.', 'elementor' ) ] );
		}

		$this->set_announcement_as_displayed();

		wp_send_json_success();
	}
}
