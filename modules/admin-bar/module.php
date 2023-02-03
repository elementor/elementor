<?php
namespace Elementor\Modules\AdminBar;

use Elementor\Core\Base\Document;
use Elementor\Core\Base\App as BaseApp;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseApp {
	/**
	 * @var Document[]
	 */
	private $documents = [];

	/**
	 * @return bool
	 */
	public static function is_active() {
		return is_admin_bar_showing();
	}

	/**
	 * @return string
	 */
	public function get_name() {
		return 'admin-bar';
	}

	/**
	 * Collect the documents that was rendered in the current page.
	 *
	 * @param Document $document
	 * @param $is_excerpt
	 */
	public function add_document_to_admin_bar( Document $document, $is_excerpt ) {
		if (
			$is_excerpt ||
			! $document::get_property( 'show_on_admin_bar' ) ||
			! $document->is_editable_by_current_user()
		) {
			return;
		}

		$this->documents[ $document->get_main_id() ] = $document;
	}

	/**
	 * Scripts for module.
	 */
	public function enqueue_scripts() {
		if ( empty( $this->documents ) ) {
			return;
		}

		// Should load 'elementor-admin-bar' before 'admin-bar'
		wp_dequeue_script( 'admin-bar' );

		wp_enqueue_script(
			'elementor-admin-bar',
			$this->get_js_assets_url( 'elementor-admin-bar' ),
			[ 'elementor-frontend-modules' ],
			ELEMENTOR_VERSION,
			true
		);

		// This is a core script of WordPress, it is not required to pass the 'ver' argument.
		wp_enqueue_script( // phpcs:ignore WordPress.WP.EnqueuedResourceParameters
			'admin-bar',
			null,
			[ 'elementor-admin-bar' ],
			false,
			true
		);

		$this->print_config( 'elementor-admin-bar' );
	}

	/**
	 * Creates admin bar menu items config.
	 *
	 * @return array
	 */
	public function get_init_settings() {
		$settings = [];

		if ( ! empty( $this->documents ) ) {
			$settings['elementor_edit_page'] = $this->get_edit_button_config();
		}

		/**
		 * Admin bar settings in the frontend.
		 *
		 * Register admin_bar config to parse later in the frontend and add to the admin bar with JS.
		 *
		 * @since 3.0.0
		 *
		 * @param array $settings the admin_bar config
		 */
		$settings = apply_filters( 'elementor/frontend/admin_bar/settings', $settings );

		return $settings;
	}

	/**
	 * Creates the config for 'Edit with elementor' menu item.
	 *
	 * @return array
	 */
	private function get_edit_button_config() {
		$queried_object_id = get_queried_object_id();
		$href = null;

		if ( is_singular() && isset( $this->documents[ $queried_object_id ] ) ) {
			$href = $this->documents[ $queried_object_id ]->get_edit_url();

			unset( $this->documents[ $queried_object_id ] );
		}

		return [
			'id' => 'elementor_edit_page',
			'title' => esc_html__( 'Edit with Elementor', 'elementor' ),
			'href' => $href,
			'children' => array_map( function ( $document ) {
				return [
					'id' => "elementor_edit_doc_{$document->get_main_id()}",
					'title' => $document->get_post()->post_title,
					'sub_title' => $document::get_title(),
					'href' => $document->get_edit_url(),
				];
			}, $this->documents ),
		];
	}

	/**
	 * Module constructor.
	 */
	public function __construct() {
		add_action( 'elementor/frontend/before_get_builder_content', [ $this, 'add_document_to_admin_bar' ], 10, 2 );
		add_action( 'wp_footer', [ $this, 'enqueue_scripts' ], 11 /* after third party scripts */ );
	}
}
