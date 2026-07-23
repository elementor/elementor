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
		AngiePromotion::init();

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

		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		?>
		<# if ( 'custom-widgets' === name ) { #>
		<button type="button" class="elementor-panel-custom-widgets__cta elementor-panel-custom-widgets__cta--heading"><i class="eicon-plus" aria-hidden="true"></i><?php echo esc_html__( 'New', 'elementor' ); ?></button>
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
			<p class="elementor-panel-category-custom-widgets-empty__message"><?php echo esc_html__( 'Create custom widgets with Angie by describing what you need.', 'elementor' ); ?></p>
		</div>
		<div class="elementor-panel-custom-widgets-community-promo">
			<div class="elementor-panel-custom-widgets-community-promo__images">
				<div class="elementor-panel-custom-widgets-community-promo__images__image" style="background-image: url(<?php echo esc_url( ELEMENTOR_ASSETS_URL . 'images/angie/community-promotion-showcase-1.png' ); ?>);"></div>
				<div class="elementor-panel-custom-widgets-community-promo__images__image" style="background-image: url(<?php echo esc_url( ELEMENTOR_ASSETS_URL . 'images/angie/community-promotion-showcase-2.png' ); ?>);"></div>
				<div class="elementor-panel-custom-widgets-community-promo__images__image" style="background-image: url(<?php echo esc_url( ELEMENTOR_ASSETS_URL . 'images/angie/community-promotion-showcase-3.png' ); ?>);"></div>
			</div>
			
			<button type="button" class="elementor-panel-custom-widgets-community-promo__button"><?php echo esc_html__( 'See what people are building', 'elementor' ); ?></button>
			<div class="elementor-panel-custom-widgets-community-promo__icon">
				<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path fill-rule="evenodd" clip-rule="evenodd" d="M4.83341 4.6665C4.83341 4.39036 5.05727 4.1665 5.33341 4.1665H11.3334C11.6096 4.1665 11.8334 4.39036 11.8334 4.6665V10.6665C11.8334 10.9426 11.6096 11.1665 11.3334 11.1665C11.0573 11.1665 10.8334 10.9426 10.8334 10.6665V5.87361L5.0203 11.6867C4.82504 11.882 4.50846 11.882 4.31319 11.6867C4.11793 11.4915 4.11793 11.1749 4.31319 10.9796L10.1263 5.1665H5.33341C5.05727 5.1665 4.83341 4.94265 4.83341 4.6665Z" fill="currentColor"/>
				</svg>
			</div>
			<div class="elementor-panel-custom-widgets-community-promo__dismiss" style="display: none;" role="button" tabindex="0" aria-label="<?php echo esc_attr__( 'Dismiss', 'elementor' ); ?>">
				<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path fill-rule="evenodd" clip-rule="evenodd" d="M12.1869 4.18705C12.3822 3.99179 12.3822 3.6752 12.1869 3.47994C11.9917 3.28468 11.6751 3.28468 11.4798 3.47994L7.83337 7.12639L4.18693 3.47994C3.99167 3.28468 3.67508 3.28468 3.47982 3.47994C3.28456 3.6752 3.28456 3.99179 3.47982 4.18705L7.12627 7.8335L3.47982 11.4799C3.28456 11.6752 3.28456 11.9918 3.47982 12.187C3.67508 12.3823 3.99167 12.3823 4.18693 12.187L7.83337 8.5406L11.4798 12.187C11.6751 12.3823 11.9917 12.3823 12.1869 12.187C12.3822 11.9918 12.3822 11.6752 12.1869 11.4799L8.54048 7.8335L12.1869 4.18705Z" fill="currentColor"/>
				</svg>
			</div>
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
