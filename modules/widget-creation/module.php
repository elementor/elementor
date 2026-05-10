<?php

namespace Elementor\Modules\WidgetCreation;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Experiments\Manager as ExperimentsManager;
use Elementor\Core\Utils\Hints;
use Elementor\Elements_Manager;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Module extends BaseModule {
	const MODULE_NAME = 'widget-creation';
	const EXPERIMENT_NAME = 'e_widget_creation';

	const PACKAGES = [
		'editor-widget-creation',
	];

	const ANGIE_CONSENT_OPTION = 'angie_external_scripts_consent';

	public function get_name() {
		return self::MODULE_NAME;
	}

	public static function get_experimental_data(): array {
		return [
			'name' => self::EXPERIMENT_NAME,
			'title' => esc_html__( 'Widget Creation', 'elementor' ),
			'description' => esc_html__( 'Promote widget creation with Angie plugin.', 'elementor' ),
			'hidden' => true,
			'default' => ExperimentsManager::STATE_ACTIVE,
			'release_status' => ExperimentsManager::RELEASE_STATUS_ALPHA,
		];
	}

	public function __construct() {
		parent::__construct();

		add_filter( 'elementor/editor/v2/packages', fn( $packages ) => $this->add_packages( $packages ) );
		add_action( 'elementor/elements/categories_registered', [ $this, 'maybe_register_custom_widgets_category_fallback' ], 100 );
		add_action( 'rest_api_init', fn() => $this->register_consent_route() );
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

	public function maybe_register_custom_widgets_category_fallback( Elements_Manager $elements_manager ): void {
		if ( ! Plugin::$instance->experiments->is_feature_active( self::EXPERIMENT_NAME ) ) {
			return;
		}

		if ( Hints::is_plugin_active( 'angie' ) ) {
			return;
		}

		$categories = $elements_manager->get_categories();

		if ( isset( $categories[ Elements_Manager::CATEGORY_CUSTOM_WIDGETS ] ) ) {
			return;
		}

		$elements_manager->add_category(
			Elements_Manager::CATEGORY_CUSTOM_WIDGETS,
			[
				'title' => esc_html__( 'Custom Widget', 'elementor' ),
				'icon' => 'eicon-ai',
				'hideIfEmpty' => false,
				'active' => true,
			]
		);

		add_action( 'elementor/editor/templates/panel/category', [ $this, 'render_custom_widgets_category_heading_cta' ] );
		add_action( 'elementor/editor/templates/panel/category/content', [ $this, 'render_custom_widgets_category_empty_state' ] );
	}

	public function render_custom_widgets_category_heading_cta(): void {
		if ( ! Plugin::$instance->experiments->is_feature_active( self::EXPERIMENT_NAME ) ) {
			return;
		}

		?>
		<# if ( 'custom-widgets' === name ) { #>
		<button type="button" class="elementor-panel-custom-widgets__cta elementor-panel-custom-widgets__cta--heading"><?php echo esc_html__( 'Try for free', 'elementor' ); ?></button>
		<# } #>
		<?php
	}

	public function render_custom_widgets_category_empty_state(): void {
		if ( ! Plugin::$instance->experiments->is_feature_active( self::EXPERIMENT_NAME ) ) {
			return;
		}

		if ( $this->custom_widgets_category_has_widgets() ) {
			return;
		}

		?>
		<# if ( 'custom-widgets' === name ) { #>
		<div class="elementor-panel-category-custom-widgets-empty">
			<p class="elementor-panel-category-custom-widgets-empty__message"><?php echo esc_html__( 'Create custom widgets by describing what you need.', 'elementor' ); ?></p>
		</div>
		<# } #>
		<?php
	}

	private function custom_widgets_category_has_widgets(): bool {
		foreach ( Plugin::$instance->widgets_manager->get_widget_types() as $widget ) {
			if ( in_array( Elements_Manager::CATEGORY_CUSTOM_WIDGETS, $widget->get_categories(), true ) ) {
				return true;
			}
		}

		return false;
	}

	private function add_packages( array $packages ): array {
		return array_merge( $packages, self::PACKAGES );
	}
}
