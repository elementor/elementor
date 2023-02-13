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
						"label" => 'Button',
						"variant" => 'primary',
						"target" => '_blank',
						"url" => 'https://google.co.il',
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
		} );

		add_filter( 'elementor/admin/localize_settings', function ( $settings ) {
			return $this->get_localize_data_admin_settings( $settings );
		} );
	}
}
