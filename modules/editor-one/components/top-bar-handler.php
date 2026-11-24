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

	private const LOGO_SVG = '<svg class="e-one-top-bar-placeholder__logo" viewBox="0 0 25 24" width="24" height="24" fill="none" focusable="false" aria-hidden="true"><path d="M12.1207 0C5.42401 0 0 5.37 0 12C0 18.63 5.42401 24 12.1207 24C18.8174 24 24.2414 18.63 24.2414 12C24.2414 5.37 18.8174 0 12.1207 0ZM8.48448 18H6.06034V6H8.48448V18ZM18.181 18H10.9086V15.6H18.181V18ZM18.181 13.2H10.9086V10.8H18.181V13.2ZM18.181 8.4H10.9086V6H18.181V8.4Z" fill="currentColor"/></svg>';

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

		// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Markup is escaped in get_placeholder_markup().
		echo '<div id="editor-one-top-bar">' . $this->get_placeholder_markup() . '</div>';
	}

	/**
	 * Static stand-in for the React header, so the admin layout is correct from the first paint.
	 * React replaces it when it mounts into `#editor-one-top-bar`.
	 */
	public function get_placeholder_markup(): string {
		return sprintf(
			'<header class="e-one-top-bar-placeholder" aria-hidden="true"><span class="e-one-top-bar-placeholder__brand">%1$s<span class="e-one-top-bar-placeholder__title">%2$s</span></span></header>',
			self::LOGO_SVG,
			esc_html__( 'website builder', 'elementor' )
		);
	}
}
