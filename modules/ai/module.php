<?php
namespace Elementor\Modules\Ai;

use Elementor\Controls_Manager;
use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Common\Modules\Connect\Module as ConnectModule;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Core\Utils\Hints;
use Elementor\Element_Base;
use Elementor\Modules\Ai\Connect\Ai;
use Elementor\Plugin;
use Elementor\User;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseModule {
	const ANGIE_IN_PANELS_EXPERIMENT_NAME = 'e_angie_in_panels';

	const ANGIE_PACKAGE = 'editor-angie';

	const ANGIE_FLOATING_PANELS_PACKAGE = 'editor-floating-panels';

	const ANGIE_PANEL_PACKAGE = 'editor-angie-panel';

	const ANGIE_ENTRY_POINTS_PACKAGE = 'editor-angie-entry-points';

	const ANGIE_CONSENT_OPTION = 'angie_external_scripts_consent';

	const ANGIE_USER_DISABLED_META_KEY = 'elementor_angie_disabled';

	const ANGIE_BLOCKED_BY_SITE_OPTION = 'elementor_angie_blocked_by_site';

	public function get_name() {
		return 'ai';
	}

	public function __construct() {
		parent::__construct();

		( new SitePlannerConnect\Module() );

		if ( is_admin() ) {
			( new Preferences() )->register();
			add_action( 'elementor/import-export/import-kit/runner/after-run', [ $this, 'handle_kit_install' ] );
		}

		$this->register_angie_in_panels_experiment();
		add_filter( 'elementor/editor/v2/packages', fn( $packages ) => $this->add_angie_packages( $packages ) );
		add_action( 'elementor/editor/v2/scripts/enqueue', [ $this, 'print_angie_config' ] );
		add_action( 'rest_api_init', fn() => $this->register_consent_route() );

		if ( ! $this->is_ai_enabled() ) {
			return;
		}

		add_action( 'elementor/connect/apps/register', function ( ConnectModule $connect_module ) {
			$connect_module->register_app( 'ai', Ai::get_class_name() );
		} );

		add_action( 'elementor/editor/v2/scripts/enqueue', function() {
			Utils::print_js_config(
				'elementor-editor',
				'ElementorAiConfig',
				$this->get_ai_config()
			);
		} );

		add_filter( 'elementor/document/save/data', [ $this, 'remove_temporary_containers' ] );

		// Styles for Angie V3 entry-point buttons (`.e-ai-button`, `.e-ai-layout-button`).
		add_action( 'elementor/editor/after_enqueue_styles', function() {
			wp_enqueue_style(
				'elementor-ai-editor',
				$this->get_css_assets_url( 'modules/ai/editor' ),
				[],
				ELEMENTOR_VERSION
			);
		} );

		add_action( 'elementor/preview/enqueue_styles', function() {
			wp_enqueue_style(
				'elementor-ai-layout-preview',
				$this->get_css_assets_url( 'modules/ai/layout-preview' ),
				[],
				ELEMENTOR_VERSION
			);
		} );

		// ED-26128: keep Animate with AI / hover AI control hosts so Angie entry points can attach.
		add_action( 'elementor/element/common/section_effects/after_section_start', [ $this, 'register_ai_motion_effect_control' ], 10, 1 );
		add_action( 'elementor/element/container/section_effects/after_section_start', [ $this, 'register_ai_motion_effect_control' ], 10, 1 );
		add_action( 'elementor/element/common/_section_transform/after_section_end', [ $this, 'register_ai_hover_effect_control' ], 10, 1 );
		add_action( 'elementor/element/container/_section_transform/after_section_end', [ $this, 'register_ai_hover_effect_control' ], 10, 1 );
	}

	public function is_ai_enabled() {
		if ( ! Plugin::$instance->experiments->is_feature_active( 'container' ) ) {
			return false;
		}

		return Preferences::is_ai_enabled( get_current_user_id() );
	}

	public static function get_angie_in_panels_experimental_data(): array {
		return [
			'name' => self::ANGIE_IN_PANELS_EXPERIMENT_NAME,
			'title' => esc_html__( 'Angie in editor panels', 'elementor' ),
			'description' => esc_html__( 'Angie in the Editor: load Angie from Elementor Core in a docked panel, with Angie entry points across the Editor.', 'elementor' ),
			'hidden' => true,
			'default' => Experiments_Manager::STATE_INACTIVE,
			'release_status' => Experiments_Manager::RELEASE_STATUS_DEV,
		];
	}

	public static function is_angie_in_panels_active(): bool {
		return Plugin::$instance->experiments->is_feature_active( self::ANGIE_IN_PANELS_EXPERIMENT_NAME );
	}

	public static function is_angie_enabled(): bool {
		if ( self::is_current_user_angie_disabled() || self::is_angie_blocked_by_site() ) {
			return false;
		}

		if ( Hints::is_plugin_active( 'angie' ) ) {
			return true;
		}

		return 'yes' === get_option( self::ANGIE_CONSENT_OPTION );
	}

	public static function is_current_user_angie_disabled(): bool {
		return (bool) get_user_meta( get_current_user_id(), self::ANGIE_USER_DISABLED_META_KEY, true );
	}

	public static function is_angie_blocked_by_site(): bool {
		return (bool) get_option( self::ANGIE_BLOCKED_BY_SITE_OPTION, false );
	}

	public function print_angie_config(): void {
		if ( ! self::is_angie_in_panels_active() ) {
			return;
		}

		Utils::print_js_config( 'elementor-v2-editor-angie', 'elementorEditorAngie', [
			'isAngiePluginActive' => Hints::is_plugin_active( 'angie' ),
			'showEntryPoints' => $this->is_ai_enabled(),
			'isExperimentActive' => true,
			'hasConsent' => 'yes' === get_option( self::ANGIE_CONSENT_OPTION ),
			'isUserDisabled' => self::is_current_user_angie_disabled(),
			'isBlockedBySite' => self::is_angie_blocked_by_site(),
			'isPluginInstalled' => Hints::is_plugin_installed( 'angie' ),
		] );
	}

	private function register_angie_in_panels_experiment(): void {
		Plugin::$instance->experiments->add_feature( self::get_angie_in_panels_experimental_data() );
	}

	private function add_angie_packages( array $packages ): array {
		if ( ! self::is_angie_in_panels_active() ) {
			return $packages;
		}

		$packages[] = self::ANGIE_FLOATING_PANELS_PACKAGE;
		$packages[] = self::ANGIE_PACKAGE;
		$packages[] = self::ANGIE_PANEL_PACKAGE;
		$packages[] = self::ANGIE_ENTRY_POINTS_PACKAGE;

		return array_values( array_unique( $packages ) );
	}

	private function register_consent_route(): void {
		register_rest_route( 'elementor/v1', '/angie/consent', [
			'methods'             => 'POST',
			'callback'            => fn() => $this->handle_save_consent(),
			'permission_callback' => fn() => current_user_can( 'manage_options' ),
		] );
	}

	private function handle_save_consent(): \WP_REST_Response {
		update_option( self::ANGIE_CONSENT_OPTION, 'yes' );

		return new \WP_REST_Response( [ 'success' => true ], 200 );
	}

	public function handle_kit_install( $imported_data ) {
		if ( ! $this->is_ai_enabled() ) {
			return;
		}

		if ( ! isset( $imported_data['status'] ) || 'success' !== $imported_data['status'] ) {
			return;
		}

		if ( ! isset( $imported_data['runner'] ) || 'site-settings' !== $imported_data['runner'] ) {
			return;
		}

		if ( ! isset( $imported_data['configData']['lastImportedSession']['instance_data']['site_settings']['settings']['ai'] ) ) {
			return;
		}

		$is_connected = $this->get_ai_app()->is_connected() && User::get_introduction_meta( 'ai_get_started' );

		if ( ! $is_connected ) {
			return;
		}

		$last_imported_session = $imported_data['configData']['lastImportedSession'];
		$imported_ai_data = $last_imported_session['instance_data']['site_settings']['settings']['ai'];

		$this->get_ai_app()->send_event( [
			'name' => 'kit_installed',
			'data' => $imported_ai_data,
			'client' => [
				'name' => 'elementor',
				'version' => ELEMENTOR_VERSION,
				'session_id' => $last_imported_session['session_id'],
			],
		] );
	}

	/**
	 * ED-26128 — Hover Transform "Animate With AI" host control for Angie.
	 *
	 * @param Element_Base $element Element.
	 * @return void
	 */
	public function register_ai_hover_effect_control( Element_Base $element ) {
		if ( $element->get_controls( 'ai_hover_animation' ) ) {
			return;
		}

		$element->start_controls_section(
			'section_ai_hover_animation',
			[
				'label' => esc_html__( 'Animate With AI', 'elementor' ),
				'tab' => Controls_Manager::TAB_ADVANCED,
			]
		);

		$element->add_control(
			'ai_hover_animation',
			[
				'label' => esc_html__( 'Animate With AI', 'elementor' ),
				'type' => Controls_Manager::RAW_HTML,
				'raw' => '
<style>
  .elementor-control-ai_hover_animation .elementor-control-content {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
  .elementor-control-ai_hover_animation .elementor-control-raw-html {
  	display: none;
  }
</style>',
				'render_type' => 'none',
				'ai' => [
					'active' => true,
					'type' => 'hover_animation',
				],
			]
		);

		$element->end_controls_section();
	}

	/**
	 * ED-26128 — Motion Effects "Animate With AI" host control for Angie (Pro).
	 *
	 * @param Element_Base $element Element.
	 * @return void
	 */
	public function register_ai_motion_effect_control( $element ) {
		if ( Utils::has_pro() && ! $element->get_controls( 'ai_animation' ) ) {
			$element->add_control(
				'ai_animation',
				[
					'label' => esc_html__( 'Animate With AI', 'elementor' ),
					'type' => Controls_Manager::RAW_HTML,
					'raw' => '
	<style>
	.elementor-control-ai_animation .elementor-control-content {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
	}
	.elementor-control-ai_animation .elementor-control-raw-html {
		display: none;
	}
	</style>',
					'render_type' => 'none',
					'ai' => [
						'active' => true,
						'type' => 'animation',
					],
				]
			);
		}
	}

	/**
	 * Every script that localizes `ElementorAiConfig` overwrites the same global, so they must share one shape.
	 *
	 * @return array
	 */
	private function get_ai_config(): array {
		return [
			'is_get_started' => User::get_introduction_meta( 'ai_get_started' ),
			'connect_url' => $this->get_ai_connect_url(),
		];
	}

	public function remove_temporary_containers( $data ) {
		if ( empty( $data['elements'] ) || ! is_array( $data['elements'] ) ) {
			return $data;
		}

		$data['elements'] = array_filter( $data['elements'], function( $element ) {
			$is_preview_container = isset( $element['id'] ) && strpos( $element['id'], 'e-ai-preview-container' ) === 0;
			$is_screenshot_container = isset( $element['id'] ) && strpos( $element['id'], 'e-ai-screenshot-container' ) === 0;

			return ! $is_preview_container && ! $is_screenshot_container;
		} );

		return $data;
	}

	private function get_ai_app(): Ai {
		return Plugin::$instance->common->get_component( 'connect' )->get_app( 'ai' );
	}

	private function get_ai_connect_url() {
		$app = $this->get_ai_app();

		return $app->get_admin_url( 'authorize', [
			'utm_source' => 'ai-popup',
			'utm_campaign' => 'connect-account',
			'utm_medium' => 'wp-dash',
			'source' => 'generic',
		] );
	}
}
