<?php

namespace Elementor\Modules\AtomicOptIn;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Core\Isolation\Elementor_Adapter;
use Elementor\Core\Isolation\Elementor_Adapter_Interface;
use Elementor\Core\Utils\Isolation_Manager;
use Elementor\Modules\ElementorCounter\Module as Elementor_Counter;
use Elementor\Plugin;
use Elementor\Settings;
use Elementor\Utils;

class Module extends BaseModule {
	const MODULE_NAME = 'editor-v4-opt-in';
	const EXPERIMENT_NAME = 'editor_v4_opt_in';
	const WELCOME_POPOVER_OPTION = '_e_welcome_popover_displayed';

	private Elementor_Adapter_Interface $elementor_adapter;

	public static function get_experimental_data(): array {
		return [
			'name' => self::EXPERIMENT_NAME,
			'title' => esc_html__( 'Editor V4 (Opt In)', 'elementor' ),
			'description' => esc_html__( 'Enable Editor V4 Opt In.', 'elementor' ),
			'hidden' => true,
			'default' => Experiments_Manager::STATE_INACTIVE,
			'release_status' => Experiments_Manager::RELEASE_STATUS_ALPHA,
		];
	}

	private function is_experiment_active() {
		return Plugin::$instance->experiments->is_feature_active( self::EXPERIMENT_NAME );
	}

	public function __construct( ?Elementor_Adapter_Interface $elementor_adapter = null ) {
		if ( ! $this->is_experiment_active() || ! is_admin() ) {
			return;
		}

		$this->elementor_adapter = $elementor_adapter ?? Isolation_Manager::get_adapter( Elementor_Adapter::class );

		$this->register_settings_tab();
		$this->register_scripts();
	}

	public function get_name() {
		return self::MODULE_NAME;
	}

	private function register_settings_tab() {
		$page_id = Settings::PAGE_ID;

		add_action( "elementor/admin/after_create_settings/{$page_id}", function( Settings $settings ) {
			$this->add_new_tab_to( $settings );
		}, 11 );
	}

	private function add_new_tab_to( Settings $settings ) {
		$settings->add_tab( self::MODULE_NAME, [
			'label' => esc_html__( 'Editor V4', 'elementor' ),
			'sections' => [
				'opt-in' => [
					'callback' => function() {
						echo '<div id="page-editor-v4-opt-in"></div>';
					},
					'fields' => [],
				],
			],
		] );

		return $this;
	}

	private function get_current_user_id(): int {
		$current_user = wp_get_current_user();

		if ( ! $current_user ) {
			return 0;
		}

		return $current_user->ID ?? 0;
	}

	private function has_welcome_popover_been_displayed(): bool {
		return get_user_meta( $this->get_current_user_id(), self::WELCOME_POPOVER_OPTION, true ) ?? false;
	}

	private function set_welcome_popover_as_displayed(): void {
		update_user_meta( $this->get_current_user_id(), self::WELCOME_POPOVER_OPTION, true );
	}

	private function is_first_editor_visit(): int {
		$editor_visit_count = $this->elementor_adapter->get_count( Elementor_Counter::EDITOR_COUNTER_KEY );
		return 1 === $editor_visit_count;
	}

	private function register_scripts() {
		add_action( 'elementor_page_elementor-settings', [ $this, 'enqueue_scripts' ] );
		add_action( 'elementor_page_elementor-settings', [ $this, 'enqueue_styles' ] );
		add_action( 'elementor/editor/before_enqueue_scripts', [ $this, 'maybe_enqueue_welcome_popover' ] );
	}

	public function maybe_enqueue_welcome_popover(): void {
		if ( $this->is_first_editor_visit() ) {
			return;
		}

		if ( $this->has_welcome_popover_been_displayed() ) {
			return;
		}

		$this->enqueue_scripts();
		$this->set_welcome_popover_as_displayed();
	}

	public function enqueue_styles() {
		wp_enqueue_style(
			$this->get_name(),
			$this->get_css_assets_url( 'modules/editor-v4-opt-in/opt-in' ),
			[],
			ELEMENTOR_VERSION
		);
	}

	public function enqueue_scripts() {
		$min_suffix = Utils::is_script_debug() ? '' : '.min';

		wp_enqueue_script(
			$this->get_name(),
			ELEMENTOR_ASSETS_URL . 'js/editor-v4-opt-in' . $min_suffix . '.js',
			[
				'react',
				'react-dom',
				'elementor-common',
				'elementor-v2-ui',
			],
			ELEMENTOR_VERSION,
			true
		);
	}
}
