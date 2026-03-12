<?php

namespace Elementor\App\Modules\Onboarding;

use Elementor\App\Modules\Onboarding\Data\Controller;
use Elementor\App\Modules\Onboarding\Data\Endpoints\Install_Theme;
use Elementor\App\Modules\Onboarding\Storage\Entities\User_Choices;
use Elementor\App\Modules\Onboarding\Storage\Entities\User_Progress;
use Elementor\App\Modules\Onboarding\Storage\Onboarding_Progress_Manager;
use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Core\Settings\Manager as SettingsManager;
use Elementor\Includes\EditorAssetsAPI;
use Elementor\Plugin;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Module extends BaseModule {

	const VERSION = '2.0.0';
	const EXPERIMENT_NAME = 'Onboarding';
	const ASSETS_BASE_URL = 'https://assets.elementor.com/onboarding/v1/strings/';
	const LEGACY_ONBOARDING_OPTION = 'elementor_onboarded';

	const SUPPORTED_LOCALES = [
		'de_DE' => 'de',
		'es_ES' => 'es',
		'fr_FR' => 'fr',
		'he_IL' => 'he',
		'id_ID' => 'id',
		'it_IT' => 'it',
		'nl_NL' => 'nl',
		'pl_PL' => 'pl',
		'pt_BR' => 'pt',
		'tr_TR' => 'tr',
	];

	private Onboarding_Progress_Manager $progress_manager;

	public function get_name(): string {
		return 'onboarding';
	}

	public static function get_experimental_data(): array {
		return [
			'name' => self::EXPERIMENT_NAME,
			'title' => esc_html__( 'New Onboarding', 'elementor' ),
			'description' => esc_html__( 'New onboarding experience for 2026 with improved user journey and progress tracking.', 'elementor' ),
			'hidden' => true,
			'default' => Experiments_Manager::STATE_INACTIVE,
			'release_status' => Experiments_Manager::RELEASE_STATUS_DEV,
		];
	}

	public static function has_user_finished_onboarding(): bool {
		if ( get_option( self::LEGACY_ONBOARDING_OPTION ) ) {
			return true;
		}

		$progress = Onboarding_Progress_Manager::instance()->get_progress();

		return null !== $progress->get_completed_at();
	}

	public function __construct() {
		if ( ! Plugin::instance()->experiments->is_feature_active( self::EXPERIMENT_NAME ) ) {
			return;
		}

		$this->progress_manager = Onboarding_Progress_Manager::instance();

		Plugin::instance()->data_manager_v2->register_controller( new Controller() );

		add_action( 'elementor/init', [ $this, 'on_elementor_init' ], 12 );

		if ( $this->should_show_starter() ) {
			add_filter( 'elementor/editor/localize_settings', [ $this, 'add_starter_settings' ] );
			add_filter( 'elementor/editor/v2/packages', [ $this, 'add_starter_packages' ] );
			add_action( 'elementor/editor/v2/styles/enqueue', [ $this, 'enqueue_fonts' ] );
			add_action( 'elementor/preview/enqueue_styles', [ $this, 'enqueue_starter_preview_css' ] );
		}
	}

	public function on_elementor_init(): void {
		if ( ! Plugin::instance()->app->is_current() ) {
			return;
		}

		$this->set_onboarding_settings();
		$this->enqueue_fonts();
	}

	public function enqueue_fonts(): void {
		wp_enqueue_style(
			'elementor-onboarding-fonts',
			'https://fonts.googleapis.com/css2?family=Poppins:wght@500&display=swap',
			[],
			ELEMENTOR_VERSION
		);
	}

	public function enqueue_starter_preview_css(): void {
		$css = '
			#site-header,
			.page-header { display: var(--e-starter-header-display, none); }
		';

		wp_register_style( 'elementor-starter-preview', false );
		wp_enqueue_style( 'elementor-starter-preview' );
		wp_add_inline_style( 'elementor-starter-preview', $css );
	}

	public function progress_manager(): Onboarding_Progress_Manager {
		return $this->progress_manager;
	}

	private function set_onboarding_settings(): void {
		if ( ! Plugin::instance()->common ) {
			return;
		}

		$progress = $this->progress_manager->get_progress();
		$choices = $this->progress_manager->get_choices();
		$steps = $this->get_steps_config();

		// If the user previously selected a theme but it's no longer the active theme,
		// clear the theme selection so the user can re-select.
		$this->maybe_invalidate_theme_selection( $progress, $choices );

		$is_connected = $this->is_user_connected();

		Plugin::$instance->app->set_settings( 'onboarding', [
			'version' => self::VERSION,
			'restUrl' => rest_url( 'elementor/v1/onboarding/' ),
			'nonce' => wp_create_nonce( 'wp_rest' ),
			'progress' => $this->validate_progress_for_steps( $progress, $steps ),
			'choices' => $choices->to_array(),
			'hadUnexpectedExit' => $progress->had_unexpected_exit(),
			'isConnected' => $is_connected,
			'userName' => $this->get_user_display_name(),
			'steps' => $steps,
			'uiTheme' => $this->get_ui_theme_preference(),
			'translations' => $this->get_translated_strings(),
			'shouldShowProInstallScreen' => $is_connected ? $this->should_show_pro_install_screen() : false,
			'urls' => [
				'dashboard' => admin_url(),
				'editor' => admin_url( 'edit.php?post_type=elementor_library' ),
				'connect' => $this->get_connect_url(),
				'comparePlans' => 'https://go.elementor.com/go-pro-onboarding-editor-features-step-upgrade/',
				'createNewPage' => Plugin::$instance->documents->get_create_new_post_url(),
				'upgradeUrl' => 'https://go.elementor.com/go-pro-onboarding-editor-header-upgrade/',
			],
		] );
	}

	private function validate_progress_for_steps( User_Progress $progress, array $steps ): array {
		$progress_data = $progress->to_array();
		$step_count = count( $steps );
		$current_step_index = $progress->get_current_step_index() ?? 0;
		$current_step_id = $progress->get_current_step_id() ?? $steps[0]['id'] ?? 'building_for';

		$is_invalid_step_index = $current_step_index < 0 || $current_step_index >= $step_count;

		if ( $is_invalid_step_index ) {
			$current_step_id = $steps[0]['id'];
			$current_step_index = 0;
		}

		$progress_data['current_step_id'] = $current_step_id;
		$progress_data['current_step_index'] = $current_step_index;

		return $progress_data;
	}

	private function is_user_connected(): bool {
		$library = $this->get_library_app();

		return $library ? $library->is_connected() : false;
	}

	private function get_connect_url(): string {
		$library = $this->get_library_app();

		if ( ! $library ) {
			return '';
		}

		return $library->get_admin_url( 'authorize', [
			'utm_source' => 'onboarding-wizard',
			'utm_campaign' => 'connect-account',
			'utm_medium' => 'wp-dash',
			'utm_term' => self::VERSION,
			'source' => 'generic',
		] ) ?? '';
	}

	private function get_library_app() {
		$connect = Plugin::instance()->common->get_component( 'connect' );

		if ( ! $connect ) {
			return null;
		}

		return $connect->get_app( 'library' );
	}

	public static function should_show_pro_install_screen(): bool {
		if ( self::is_elementor_pro_installed() ) {
			return false;
		}

		$connect = Plugin::$instance->common->get_component( 'connect' );

		if ( ! $connect ) {
			return false;
		}

		$pro_install_app = $connect->get_app( 'pro-install' );

		if ( ! $pro_install_app || ! $pro_install_app->is_connected() ) {
			return false;
		}

		$download_link = $pro_install_app->get_download_link();

		return ! empty( $download_link );
	}

	private function get_ui_theme_preference(): string {
		$editor_preferences = SettingsManager::get_settings_managers( 'editorPreferences' );

		$ui_theme = $editor_preferences->get_model()->get_settings( 'ui_theme' );

		return $ui_theme ? $ui_theme : 'auto';
	}

	private function get_user_display_name(): string {
		$library = $this->get_library_app();

		if ( ! $library || ! $library->is_connected() ) {
			return '';
		}

		$user = $library->get( 'user' );

		return $user->first_name ?? '';
	}

	public function should_show_starter(): bool {
		if ( ! Plugin::instance()->experiments->is_feature_active( self::EXPERIMENT_NAME ) ) {
			return false;
		}

		$progress = $this->progress_manager->get_progress();

		return null !== $progress->get_completed_at() && ! $progress->is_starter_dismissed();
	}

	public function add_starter_packages( array $packages ): array {
		$packages[] = 'editor-starter';

		return $packages;
	}

	public function add_starter_settings( array $settings ): array {
		$settings['starter'] = [
			'restPath' => 'elementor/v1/onboarding/user-progress',
			'aiPlannerUrl' => 'https://planner.elementor.com/home.html',
		];

		return $settings;
	}

	private function maybe_invalidate_theme_selection( User_Progress $progress, User_Choices $choices ): void {
		$selected_theme = $choices->get_theme_selection();

		if ( empty( $selected_theme ) ) {
			return;
		}

		$active_theme = get_stylesheet();

		if ( $active_theme !== $selected_theme ) {
			$completed = $this->filter_out_theme_selection_step( $progress->get_completed_steps() );
			$progress->set_completed_steps( $completed );
			$this->progress_manager->save_progress( $progress );

			$choices->set_theme_selection( null );
			$this->progress_manager->save_choices( $choices );
		}
	}

	private function filter_out_theme_selection_step( array $steps ): array {
		return array_values( array_filter( $steps, function ( $step ) {
			return 'theme_selection' !== $step;
		} ) );
	}

	private function get_translated_strings(): array {
		$locale = $this->get_onboarding_locale();

		$api = new EditorAssetsAPI( [
			EditorAssetsAPI::ASSETS_DATA_URL => self::ASSETS_BASE_URL . $locale . '.json',
			EditorAssetsAPI::ASSETS_DATA_TRANSIENT_KEY => '_elementor_onboarding_strings_' . $locale,
			EditorAssetsAPI::ASSETS_DATA_KEY => 'translations',
		] );

		return $api->get_assets_data();
	}

	private function get_onboarding_locale(): string {
		static $flipped_locales = null;

		if ( null === $flipped_locales ) {
			$flipped_locales = array_flip( self::SUPPORTED_LOCALES );
		}

		$user_locale = get_user_locale();

		if ( isset( self::SUPPORTED_LOCALES[ $user_locale ] ) ) {
			return $user_locale;
		}

		$locale = substr( $user_locale, 0, 2 );

		if ( isset( $flipped_locales[ $locale ] ) ) {
			return $flipped_locales[ $locale ];
		}

		return 'en';
	}

	private function get_steps_config(): array {
		$steps = [
			[
				'id' => 'building_for',
				'label' => __( 'Who are you building for?', 'elementor' ),
				'type' => 'single',
			],
			[
				'id' => 'site_about',
				'label' => __( 'What is your site about?', 'elementor' ),
				'type' => 'multiple',
			],
			[
				'id' => 'experience_level',
				'label' => __( 'How much experience do you have with Elementor?', 'elementor' ),
				'type' => 'single',
			],
		];

		if ( ! $this->is_elementor_theme_active() ) {
			$steps[] = [
				'id' => 'theme_selection',
				'label' => __( 'Start with a theme that fits your needs', 'elementor' ),
				'type' => 'single',
			];
		}

		if ( ! self::is_elementor_pro_installed() ) {
			$steps[] = [
				'id' => 'site_features',
				'label' => __( 'What do you want to include in your site?', 'elementor' ),
				'type' => 'multiple',
			];
		}

		return apply_filters( 'elementor/onboarding/steps', $steps );
	}

	private static function is_elementor_pro_installed(): bool {
		$is_pro_installed = Utils::has_pro() || Utils::is_pro_installed_and_not_active();
		return (bool) apply_filters( 'elementor/onboarding/is_elementor_pro_installed', $is_pro_installed );
	}

	private function is_elementor_theme_active(): bool {
		$active_theme = get_stylesheet();
		$is_active = in_array( $active_theme, Install_Theme::ALLOWED_THEMES, true );

		return (bool) apply_filters( 'elementor/onboarding/is_elementor_theme_active', $is_active );
	}
}
