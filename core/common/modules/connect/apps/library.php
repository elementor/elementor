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
			return new \WP_Error( '401', __( 'Connecting to the Library failed. Please try reloading the page and try again', 'elementor' ) );
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
				'library/connect:title' => __( 'Connect to Template Library', 'elementor' ),
				'library/connect:message' => __( 'Access this template and our entire library by creating a free personal account', 'elementor' ),
				'library/connect:button' => __( 'Get Started', 'elementor' ),
			],
			'library_connect' => [
				'is_connected' => $is_connected,
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
