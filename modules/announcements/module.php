<?php

namespace Elementor\Modules\Announcements;

use Elementor\Core\Base\App as BaseApp;
use Elementor\Modules\Announcements\Classes\Announcement;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseApp {

	/**
	 * @return bool
	 */
	public static function is_active(): bool {
		return is_admin();
	}

	/**
	 * @return string
	 */
	public function get_name(): string {
		return 'announcements';
	}

	/**
	 * Render wrapper for the app to load
	 */
	private function render_app_wrapper() {
		?>
		<div id="e-announcements-root"></div>
		<?php
	}

	/**
	 * Enqueue app scripts
	 */
	private function enqueue_scripts() {
		wp_enqueue_script(
			'announcements-app',
			$this->get_js_assets_url( 'announcements-app' ),
			[],
			ELEMENTOR_VERSION,
			true
		);

		$this->print_config( 'announcements-app' );
	}
	protected function get_init_settings() {
		return [
			'nisim' => 'bisim',
		];
	}
	/**
	 * Enqueue the module styles.
	 *
	 * @return void
	 */
	public function enqueue_styles() {
		wp_enqueue_style(
			'announcements-app',
			$this->get_css_assets_url( 'modules/announcements/announcements' ),
			[],
			ELEMENTOR_VERSION
		);
	}
	/**
	 * Retrieve all announcement in raw format ( array )
	 * @return array[]
	 */
	private function get_raw_announcements(): array {
		//@TODO - Change to real data
		return [
			[
				"title" => 'Title of the announcement',
				"description" => 'Description of the announcement, of the announcement of the announcement, of the announcement of the announcement.',
				"media" => [
					"type" => 'image',
					"src" => 'https://dalicanvas.co.il/wp-content/uploads/2020/02/אריה-צבעוני-1200x839.jpg',
				],
				"cta" => [
					[
						"label" => 'Main CTA',
						"variant" => 'primary',
						"target" => '_blank',
						"url" => 'https://google.co.il',
					],
					[
						"label" => 'Secondary now',
						"variant" => 'secondary',
						"target" => '_blank',
						"url" => 'https://walla.co.il',
					],
					[
						"label" => 'Learn more',
						"target" => '_blank',
						"url" => 'https://ynet.co.il',
					],
				],
				"triggers" => [
					[
						"action" => 'isFlexContainerInactive',
					],
				],
			],
		];
	}

	/**
	 * Retrieve all announcement objects
	 * @return array
	 */
	private function get_announcements(): array {
		$announcements = [];
		foreach ( $this->get_raw_announcements() as $announcement_data ) {
			$announcements[] = new Announcement( $announcement_data );
		}

		return $announcements;
	}

	/**
	 * @return array
	 */
	private function get_active_announcements(): array {
		$active_announcements = [];
		foreach ( $this->get_announcements() as $announcement ) {
			if ( ! $announcement->is_active() ) {
				continue;
			}
			$active_announcements[] = $announcement;
		}

		return $active_announcements;
	}

	/**
	 * @param array $settings
	 *
	 * @return array
	 */
	private function get_localize_data_admin_settings( array $settings ): array {
		$active_announcements = $this->get_active_announcements();
		$additional_settings = [];

		foreach ( $active_announcements as $announcement ) {
			$additional_settings[] = $announcement->get_prepared_data();
			//@TODO - replace with ajax request from the front after actually triggered
			$announcement->after_triggered();
		}

		return array_merge( $settings, [
			'announcements' => $additional_settings,
		] );
	}

	/**
	 * Module constructor.
	 */
	public function __construct() {
		if ( empty( $this->get_active_announcements() ) ) {
			return;
		}
		parent::__construct();

		add_action( 'in_admin_footer', function () {
			$this->render_app_wrapper();
		} );

		add_action( 'admin_enqueue_scripts', function () {
			$this->enqueue_scripts();
			$this->enqueue_styles();
		} );
		//@TODO - replace with settings ( module config )
		add_filter( 'elementor/admin/localize_settings', function ( $settings ) {
			return $this->get_localize_data_admin_settings( $settings );
		} );
	}
}
