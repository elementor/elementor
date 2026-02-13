<?php

namespace Elementor\App\Modules\E_Onboarding;

use Elementor\App\Modules\E_Onboarding\Data\Controller;
use Elementor\App\Modules\E_Onboarding\Storage\Onboarding_Progress_Manager;
use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Core\Settings\Manager as SettingsManager;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Module extends BaseModule {

	const VERSION = '1.0.0';
	const EXPERIMENT_NAME = 'e_onboarding';

	private Onboarding_Progress_Manager $progress_manager;

	public function get_name(): string {
		return 'e-onboarding';
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

	public function __construct() {
		if ( ! Plugin::$instance->experiments->is_feature_active( self::EXPERIMENT_NAME ) ) {
			return;
		}

		$this->progress_manager = Onboarding_Progress_Manager::instance();

		Plugin::$instance->data_manager_v2->register_controller( new Controller() );

		add_action( 'elementor/init', [ $this, 'on_elementor_init' ], 12 );

		if ( $this->should_show_starter() ) {
			add_filter( 'elementor/editor/v2/packages', [ $this, 'add_editor_packages' ] );
			add_filter( 'elementor/editor/v2/scripts/env', [ $this, 'add_editor_env' ] );
		}
	}

	public function on_elementor_init(): void {
		if ( ! Plugin::$instance->app->is_current() ) {
			return;
		}

		$this->set_onboarding_settings();
	}

	public function progress_manager(): Onboarding_Progress_Manager {
		return $this->progress_manager;
	}

	private function set_onboarding_settings(): void {
		if ( ! Plugin::$instance->common ) {
			return;
		}

		$progress = $this->progress_manager->get_progress();
		$choices = $this->progress_manager->get_choices();
		$steps = $this->get_steps_config();

		Plugin::$instance->app->set_settings( 'e-onboarding', [
			'version' => self::VERSION,
			'restUrl' => rest_url( 'elementor/v1/e-onboarding/' ),
			'nonce' => wp_create_nonce( 'wp_rest' ),
			'progress' => array_merge( $progress->to_array(), [
				'current_step_id' => $progress->get_current_step_id() ?? $steps[0]['id'] ?? 'building_for',
				'current_step_index' => $progress->get_current_step_index() ?? 0,
			] ),
			'choices' => $choices->to_array(),
			'hadUnexpectedExit' => $progress->had_unexpected_exit(),
			'isConnected' => $this->is_user_connected(),
			'userName' => $this->get_user_display_name(),
			'steps' => $steps,
			'uiTheme' => $this->get_ui_theme_preference(),
			'urls' => [
				'dashboard' => admin_url(),
				'editor' => admin_url( 'edit.php?post_type=elementor_library' ),
				'connect' => $this->get_connect_url(),
			],
		] );
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

		return $library->get_admin_url( 'authorize' ) ?? '';
	}

	private function get_library_app() {
		$connect = Plugin::$instance->common->get_component( 'connect' );

		if ( ! $connect ) {
			return null;
		}

		return $connect->get_app( 'library' );
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

	private function should_show_starter(): bool {
		return true;
		$progress = $this->progress_manager->get_progress();

		return null !== $progress->get_completed_at() && ! $progress->is_starter_dismissed();
	}

	public function add_editor_packages( array $packages ): array {
		$packages[] = 'editor-starter';

		return array_unique( $packages );
	}

	public function add_editor_env( array $env ): array {
		$env['@elementor/editor-starter'] = array_merge(
			$env['@elementor/editor-starter'] ?? [],
			[
				'welcome_screen' => [
					'show' => true,
				],
			]
		);

		return $env;
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
			[
				'id' => 'theme_selection',
				'label' => __( 'Start with a theme that fits your needs', 'elementor' ),
				'type' => 'single',
			],
			[
				'id' => 'site_features',
				'label' => __( 'What do you want to include in your site?', 'elementor' ),
				'type' => 'multiple',
			],
		];

		return apply_filters( 'elementor/e-onboarding/steps', $steps );
	}
}
