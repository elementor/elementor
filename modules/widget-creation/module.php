<?php

namespace Elementor\Modules\WidgetCreation;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\AtomicWidgets\Module as Atomic_Widgets_Module;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Module extends BaseModule {
	const EXPERIMENT_NAME = Atomic_Widgets_Module::EXPERIMENT_NAME;
	const ANGIE_IN_PANELS_EXPERIMENT_NAME = 'e_angie_in_panels';
	const MODULE_NAME = 'widget-creation';

	const PACKAGES = [
		'editor-widget-creation',
	];

	const ANGIE_CONSENT_OPTION = 'angie_external_scripts_consent';

	public function get_name() {
		return self::MODULE_NAME;
	}

	public static function get_angie_in_panels_experimental_data(): array {
		return [
			'name' => self::ANGIE_IN_PANELS_EXPERIMENT_NAME,
			'title' => esc_html__( 'Angie in editor panels', 'elementor' ),
			'description' => esc_html__( 'Load Angie in a docked floating panel in the editor instead of the legacy push sidebar.', 'elementor' ),
			'hidden' => true,
			'default' => Experiments_Manager::STATE_INACTIVE,
			'release_status' => Experiments_Manager::RELEASE_STATUS_DEV,
		];
	}

	public function __construct() {
		parent::__construct();
		$this->register_angie_in_panels_experiment();

		add_filter( 'elementor/editor/v2/packages', fn( $packages ) => $this->add_packages( $packages ) );
		add_action( 'rest_api_init', fn() => $this->register_consent_route() );
	}

	private function register_angie_in_panels_experiment(): void {
		Plugin::$instance->experiments->add_feature( self::get_angie_in_panels_experimental_data() );
	}

	public static function is_angie_in_panels_active(): bool {
		return Plugin::$instance->experiments->is_feature_active( self::ANGIE_IN_PANELS_EXPERIMENT_NAME );
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

	private function add_packages( array $packages ): array {
		return array_merge( $packages, self::PACKAGES );
	}
}
