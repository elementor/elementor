<?php

namespace Elementor\Modules\DynamicAssetsManager;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Experiments\Manager as ExperimentsManager;
use Elementor\Plugin;
use Elementor\Preview;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Module extends BaseModule {

	public const EXPERIMENT_NAME = 'e_dynamic_assets_manager';

	public function get_name() {
		return 'dynamic-assets-manager';
	}

	public static function get_experimental_data(): array {
		return [
			'name' => self::EXPERIMENT_NAME,
			'title' => esc_html__( 'Dynamic assets manager', 'elementor' ),
			'description' => esc_html__( 'On-demand editor assets for registered widget types.', 'elementor' ),
			'hidden' => true,
			'default' => ExperimentsManager::STATE_INACTIVE,
			'release_status' => ExperimentsManager::RELEASE_STATUS_DEV,
			'mutable' => true,
		];
	}

	public function __construct() {
		parent::__construct();

		if ( ! Plugin::$instance->experiments->is_feature_active( self::EXPERIMENT_NAME ) ) {
			return;
		}

		add_action( Hooks::ACTION_REGISTER, [ $this, 'register_pilot_managed_widgets' ], 10, 2 );
		add_action( 'elementor/preview/init', [ $this, 'on_preview_init' ], 1 );
	}

	public function register_pilot_managed_widgets( Registry $registry, Consumer_Context $context ): void {
		if ( Consumer_Context::SURFACE_EDITOR_CANVAS !== $context->get_surface() ) {
			return;
		}

		$registry->register_managed_widget_type( 'image-carousel' );
	}

	public function on_preview_init( Preview $preview ): void {
		Preview_Assets_Coordinator::bootstrap_on_preview_init( $preview );
		$this->register_preview_loader_script();
	}

	private function register_preview_loader_script(): void {
		$suffix = Utils::is_script_debug() ? '' : '.min';

		wp_register_script(
			Hooks::SCRIPT_HANDLE,
			ELEMENTOR_ASSETS_URL . 'js/e-dynamic-assets-preview-loader' . $suffix . '.js',
			[ 'elementor-frontend' ],
			ELEMENTOR_VERSION,
			true
		);
	}

	public static function preview_should_use_selective_widget_assets(): bool {
		return Plugin::$instance->experiments->is_feature_active( self::EXPERIMENT_NAME );
	}

	public static function enqueue_preview_managed_styles( int $post_id ): void {
		if ( ! self::preview_should_use_selective_widget_assets() || ! Preview_Assets_Coordinator::is_preview_bootstrap_ready() ) {
			return;
		}

		$registry = Preview_Assets_Coordinator::get_registry();
		$controller = new Enqueue_Controller( $registry, new Legacy_Widget_Depends_Adapter(), new Document_Widget_Type_Scanner() );
		$controller->enqueue_managed_widget_styles_for_document( $post_id );
	}

	public static function enqueue_preview_managed_scripts( int $post_id ): void {
		if ( ! self::preview_should_use_selective_widget_assets() || ! Preview_Assets_Coordinator::is_preview_bootstrap_ready() ) {
			return;
		}

		$registry = Preview_Assets_Coordinator::get_registry();
		$controller = new Enqueue_Controller( $registry, new Legacy_Widget_Depends_Adapter(), new Document_Widget_Type_Scanner() );
		$controller->enqueue_managed_widget_scripts_for_document( $post_id );

		wp_enqueue_script( Hooks::SCRIPT_HANDLE );

		$context = Preview_Assets_Coordinator::get_context();
		$map = $controller->get_client_asset_map( $post_id, $context );
		$server_loaded_handles = $controller->get_server_enqueued_handle_ids( $post_id );
		$adapter = new Legacy_Widget_Depends_Adapter();
		$managed_graphs = [];

		foreach ( $registry->get_managed_widget_types() as $widget_type ) {
			$managed_graphs[ $widget_type ] = $adapter->get_graph_for_widget_type( $widget_type );
		}

		wp_localize_script(
			Hooks::SCRIPT_HANDLE,
			'elementorDynamicAssetsPreview',
			[
				'assetMap' => $map,
				'managedWidgetTypes' => $registry->get_managed_widget_types(),
				'managedGraphs' => $managed_graphs,
				'serverLoadedHandles' => $server_loaded_handles,
			]
		);
	}

	public static function enqueue_unmanaged_widgets_styles(): void {
		foreach ( Plugin::$instance->widgets_manager->get_widget_types() as $name => $widget ) {
			$registry = Preview_Assets_Coordinator::get_registry();
			if ( $registry && $registry->is_managed_widget_type( $name ) ) {
				continue;
			}
			$widget->enqueue_styles();
		}
	}

	public static function enqueue_unmanaged_widgets_scripts(): void {
		foreach ( Plugin::$instance->widgets_manager->get_widget_types() as $name => $widget ) {
			$registry = Preview_Assets_Coordinator::get_registry();
			if ( $registry && $registry->is_managed_widget_type( $name ) ) {
				continue;
			}
			$widget->enqueue_scripts();
		}
	}
}
