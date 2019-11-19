<?php
namespace Elementor\Core\Common\Modules\Connect\Apps;

use Elementor\User;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Library extends Common_App {
	public function get_title() {
		return __( 'Library', 'elementor' );
	}

	/**
	 * @since 2.3.0
	 * @access protected
	 */
	protected function get_slug() {
		return 'library';
	}

	public function get_template_content( $id ) {
		if ( ! $this->is_connected() ) {
			return new \WP_Error( '401', __( 'Not connected', 'elementor' ) . ', ' . __( 'Try reload the page', 'elementor' ) );
		}

		$body_args = [
			'id' => $id,

			// Which API version is used.
			'api_version' => ELEMENTOR_VERSION,
			// Which language to return.
			'site_lang' => get_bloginfo( 'language' ),
		];

		/**
		 * API: Template body args.
		 *
		 * Filters the body arguments send with the GET request when fetching the content.
		 *
		 * @since 1.0.0
		 *
		 * @param array $body_args Body arguments.
		 */
		$body_args = apply_filters( 'elementor/api/get_templates/body_args', $body_args );

		$template_content = $this->request( 'get_template_content', $body_args, true );

		return $template_content;
	}

	public function localize_settings( $settings ) {
		$is_connected = $this->is_connected();

		return array_replace_recursive( $settings, [
			'i18n' => [
				// Route: library/connect
				'library/connect:title' => __( 'Create Account & Get Template', 'elementor' ),
				'library/connect:message' => __( 'To get access to this template and to our entire library, you must create a free account', 'elementor' ),
				'library/connect:button' => __( 'Connect to Insert', 'elementor' ),

				// Route: library/first-connect
				'library/first-connect:title' => __( 'Get Access to the Template Library', 'elementor' ),
				'library/first-connect:message' => __( 'Create a free account and enjoy hundreds of designer-made templates', 'elementor' ),
				'library/first-connect:button' => __( 'Connect Now', 'elementor' ),
			],
			'library_connect' => [
				'is_connected' => $is_connected,
				'show_popup' => ! $is_connected && ! User::get_introduction_meta( 'library_connect' ),
			],
		] );
	}

	public function library_connect_popup_seen() {
		User::set_introduction_viewed( [
			'introductionKey' => 'library_connect',
		] );
	}

	/**
	 * @param \Elementor\Core\Common\Modules\Ajax\Module $ajax_manager
	 */
	public function register_ajax_actions( $ajax_manager ) {
		$ajax_manager->register_ajax_action( 'library_connect_popup_seen', [ $this, 'library_connect_popup_seen' ] );
	}

	protected function init() {
		add_filter( 'elementor/editor/localize_settings', [ $this, 'localize_settings' ] );
		add_action( 'elementor/ajax/register_actions', [ $this, 'register_ajax_actions' ] );
	}
}
