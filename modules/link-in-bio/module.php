<?php

namespace Elementor\Modules\LinkInBio;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Experiments\Manager;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Module extends BaseModule {

	const EXPERIMENT_NAME = 'link-in-bio';

	public function get_name(): string {
		return static::EXPERIMENT_NAME;
	}

	public function get_widgets(): array {
		return [
			'Link_In_Bio',
		];
	}

	// TODO: This is a hidden experiment which needs to remain enabled like this until 3.26 for pro compatibility.
	public static function get_experimental_data() {
		return [
			'name' => self::EXPERIMENT_NAME,
			'title' => esc_html__( 'Link In Bio', 'elementor' ),
			'hidden' => true,
			'default' => Manager::STATE_ACTIVE,
			'release_status' => Manager::RELEASE_STATUS_STABLE,
			'mutable' => false,
		];
	}

	public function __construct() {
		parent::__construct();

		add_action( 'elementor/frontend/after_register_styles', [ $this, 'register_styles' ] );
	}

	/**
	 * Register styles.
	 *
	 * At build time, Elementor compiles `/modules/link-in-bio/assets/scss/frontend.scss`
	 * to `/assets/css/widget-link-in-bio.min.css`.
	 *
	 * @return void
	 */
	public function register_styles() {
		wp_register_style(
			'widget-link-in-bio',
			$this->get_css_assets_url( 'widget-link-in-bio', null, true, true ),
			[ 'elementor-frontend' ],
			ELEMENTOR_VERSION
		);
	}
}
