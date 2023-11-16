<?php

namespace Elementor\Modules\Announcements;

use Elementor\Core\Base\App as BaseApp;
use Elementor\Modules\Announcements\Classes\Announcement;
use Elementor\Settings as ElementorSettings;

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
	 * Render wrapper for the app to load.
	 */
	private function render_app_wrapper() {
		?>
		<div id="e-announcements-root"></div>
		<?php
	}

	/**
	 * Enqueue app scripts.
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

	/**
	 * Get initialization settings to use in frontend.
	 *
	 * @return array[]
	 */
	protected function get_init_settings(): array {
		$active_announcements = $this->get_active_announcements();
		$additional_settings = [];

		foreach ( $active_announcements as $announcement ) {
			$additional_settings[] = $announcement->get_prepared_data();
			//@TODO - replace with ajax request from the front after actually triggered
			$announcement->after_triggered();
		}

		return [
			'announcements' => $additional_settings,
		];
	}

	/**
	 * Enqueue the module styles.
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
	 * Retrieve all announcement in raw format ( array ).
	 *
	 * @return array[]
	 */
	private function get_raw_announcements(): array {
		$raw_announcements = [
			[
				'title' => 'Unlock the Power of Elementor AI',
				'description' => '<p>Design professional websites with natively integrated AI tools.</p>
				<ul>
					<li>Let AI write or edit your text, adjust its length and tone of voice. Also generate custom code that seamlessly integrates into your website.</li>
					<li>Create one-of-a kind images, add, or erase content in existing images or expand them beyond their original size and aspect ratio.</li>
					<li>Access and repurpose previously-generated prompts with Elementor’s AI History Panel to streamline your workflow and ensure consistency.</li>
				</ul>',
				'media' => [
					'type' => 'image',
					'src' => ELEMENTOR_ASSETS_URL . 'images/announcement.png?' . ELEMENTOR_VERSION,
				],
				'cta' => [
					[
						'label' => 'Continue',
						'variant' => 'primary',
						'target' => '_blank',
					],
					[
						'label' => 'Learn More',
						'target' => '_blank',
						'url' => 'https://go.elementor.com/whats-new-popup-learn-elementor-ai/',
					],
				],
				'triggers' => [
					[
						'action' => 'aiStared',
					],
				],
			],
		];

		// DO NOT USE THIS FILTER
		return apply_filters( 'elementor/announcements/raw_announcements', $raw_announcements );
	}

	/**
	 * Retrieve all announcement objects.
	 *
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
	 * Retrieve all active announcement objects.
	 *
	 * @return array
	 */
	private function get_active_announcements(): array {
		$active_announcements = [];
		foreach ( $this->get_announcements() as $announcement ) {
			if ( $announcement->is_active() ) {
				$active_announcements[] = $announcement;
			}
		}

		return $active_announcements;
	}

	public function __construct() {
		parent::__construct();

		add_action( 'elementor/init', [ $this, 'on_elementor_init' ] );
	}

	public function on_elementor_init() {
		if ( empty( $this->get_active_announcements() ) ) {
			return;
		}

		add_action( 'elementor/editor/footer', function () {
			$this->render_app_wrapper();
		} );

		add_action( 'elementor/editor/after_enqueue_scripts', function () {
			$this->enqueue_scripts();
			$this->enqueue_styles();
		} );
	}
}
