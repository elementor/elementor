<?php

namespace Elementor\Modules\EditorOne\Components;

use Elementor\Modules\EditorOne\Classes\Elementor_One_Language_Mapper;
use Elementor\Modules\EditorOne\Classes\Menu_Data_Provider;
use Elementor\Modules\EditorOne\Classes\Top_Bar_Locale_Assets;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Top_Bar_Handler {

	private Menu_Data_Provider $menu_data_provider;

	public function __construct() {
		$this->menu_data_provider = Menu_Data_Provider::instance();
		Top_Bar_Locale_Assets::register_script_loader_filter();
		$this->register_actions();
	}

	private function register_actions(): void {
		add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_assets' ] );
		add_action( 'in_admin_header', [ $this, 'render_top_bar_container' ] );
	}

	public function enqueue_assets(): void {
		if ( ! $this->menu_data_provider->is_editor_one_admin_page() ) {
			return;
		}

		$min_suffix = Utils::is_script_debug() ? '' : '.min';

		wp_enqueue_style(
			'elementor-one-top-bar',
			ELEMENTOR_ASSETS_URL . 'css/modules/editor-one/top-bar' . $min_suffix . '.css',
			[],
			ELEMENTOR_VERSION
		);

		wp_enqueue_script(
			'editor-one-top-bar',
			ELEMENTOR_ASSETS_URL . 'js/editor-one-top-bar' . $min_suffix . '.js',
			[
				'react',
				'react-dom',
				'elementor-common',
				'elementor-v2-ui',
				'elementor-v2-icons',
			],
			ELEMENTOR_VERSION,
			true
		);

		$wordpress_locale = get_user_locale();
		$language_codes = Elementor_One_Language_Mapper::get_top_bar_language_codes( $wordpress_locale );
		$locale_language_base_urls = Top_Bar_Locale_Assets::enqueue_for_languages( $language_codes );

		wp_localize_script(
			'editor-one-top-bar',
			'elementorOneTopBarConfig',
			[
				'version' => ELEMENTOR_VERSION,
				'title' => __( 'website builder', 'elementor' ),
				'environment' => apply_filters( 'elementor/environment', 'production' ),
				'locale' => $wordpress_locale,
				'localeLanguageBaseUrls' => $locale_language_base_urls,
			]
		);
	}

	public function render_top_bar_container(): void {
		if ( ! $this->menu_data_provider->is_editor_one_admin_page() ) {
			return;
		}

		echo '<div id="editor-one-top-bar"></div>';
	}
}
