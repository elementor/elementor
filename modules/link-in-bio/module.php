<?php

namespace Elementor\Modules\LinkInBio;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Experiments\Manager;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Module extends BaseModule {

	const EXPERIMENT_NAME = 'link-in-bio';

	public static function is_active(): bool {
		return Plugin::$instance->experiments->is_feature_active( static::EXPERIMENT_NAME );
	}

	public function get_name(): string {
		return static::EXPERIMENT_NAME;
	}

	public function get_widgets(): array {
		return [
			'Link_In_Bio',
		];
	}

	public static function get_experimental_data(): array {
		return [
			'name' => static::EXPERIMENT_NAME,
			'title' => esc_html__( 'Link In Bio', 'elementor' ),
			'description' => esc_html__( 'Create bio link landing pages and digital business cards that convert with Link in Bio widgets. Share your link in bio pages on your social media profiles. Create as many as you need for different audiences and goals.', 'elementor' ),
			'default' => Manager::STATE_INACTIVE,
			'release_status' => Manager::RELEASE_STATUS_BETA,
			'new_site' => [
				'default_active' => true,
				'minimum_installation_version' => '3.23.0',
			],
		];
	}

	public function __construct() {
		parent::__construct();

		add_filter( 'elementor/widgets/additional_widgets_styles', [ $this, 'register_widget_styles' ] );
	}

	/**
	 * Registered widget styles.
	 * 
	 * At build time, Elementor compiles `/modules/link-in-bio/assets/scss/frontend.scss`
	 * to `/assets/css/widget-link-in-bio.min.css`.
	 *
	 * @return array
	 */
	public function register_widget_styles( array $additional_widgets_styles ) : array {
		$additional_widgets_styles[] = [
			'handle' => 'widget-link-in-bio',
			'file_path' => $this->get_css_assets_url( 'widget-link-in-bio', null, true, true ),
			[],
			ELEMENTOR_VERSION
		];

		return $additional_widgets_styles;
	}
}
