<?php
namespace Elementor\Modules\Interactions;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\AtomicWidgets\Module as AtomicWidgetsModule;
use Elementor\Plugin;
use Elementor\Utils;


if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseModule {
	const MODULE_NAME = 'e-interactions';
	const EXPERIMENT_NAME = 'e_interactions';

	const HANDLE_MOTION_JS            = 'motion-js';
	const HANDLE_SHARED_UTILS         = 'elementor-interactions-shared-utils';
	const HANDLE_FRONTEND             = 'elementor-interactions';
	const HANDLE_EDITOR               = 'elementor-editor-interactions';
	const JS_CONFIG_OBJECT            = 'ElementorInteractionsConfig';
	const SCRIPT_ID_INTERACTIONS_DATA = 'elementor-interactions-data';

	public function get_name() {
		return self::MODULE_NAME;
	}

	private $preset_animations;

	private $frontend_handler;

	private function get_presets() {
		if ( ! $this->preset_animations ) {
			$this->preset_animations = new Presets();
		}

		return $this->preset_animations;
	}

	private function get_frontend_handler() {
		if ( ! $this->frontend_handler ) {
			$this->frontend_handler = new Interactions_Frontend_Handler( fn () => $this->get_config() );
		}

		return $this->frontend_handler;
	}

	public static function get_experimental_data() {
		return [
			'name' => self::EXPERIMENT_NAME,
			'title' => esc_html__( 'Interactions', 'elementor' ),
			'description' => esc_html__( 'Enable element interactions.', 'elementor' ),
			'hidden' => true,
			'default' => Experiments_Manager::STATE_ACTIVE,
			'release_status' => Experiments_Manager::RELEASE_STATUS_DEV,
		];
	}

	public function is_experiment_active() {
		return Plugin::$instance->experiments->is_feature_active( self::EXPERIMENT_NAME )
			&& Plugin::$instance->experiments->is_feature_active( AtomicWidgetsModule::EXPERIMENT_NAME );
	}

	public function __construct() {
		parent::__construct();

		if ( ! $this->is_experiment_active() ) {
			return;
		}

		add_action( 'elementor/frontend/after_register_scripts', fn () => $this->register_frontend_scripts() );
		add_action( 'elementor/editor/before_enqueue_scripts', fn () => $this->enqueue_editor_scripts() );
		add_action( 'elementor/preview/enqueue_scripts', fn () => $this->enqueue_preview_scripts() );
		add_action( 'elementor/editor/after_enqueue_scripts', fn () => $this->enqueue_editor_scripts() );

		// Collect interactions from documents before they render (header, footer, post content)
		add_filter( 'elementor/frontend/builder_content_data', [ $this->get_frontend_handler(), 'collect_document_interactions' ], 10, 2 );

		// Output centralized interaction data in footer
		add_action( 'wp_footer', [ $this->get_frontend_handler(), 'print_interactions_data' ], 1 );

		add_filter( 'elementor/document/save/data',
			/**
			 * @throws \Exception
			 */
			function( $data, $document ) {
				$validation = new Validation();
				$document_after_sanitization = $validation->sanitize( $data );
				$validation->validate();

				return $document_after_sanitization;
			},
		10, 2 );

		add_filter( 'elementor/document/save/data', function( $data, $document ) {
			return ( new Parser( $document->get_main_id() ) )->assign_interaction_ids( $data );
		}, 11, 2 );
	}

	public function get_config() {
		return [
			'constants' => $this->get_presets()->defaults(),
			'breakpoints' => $this->get_active_breakpoints(),
		];
	}

	private function get_active_breakpoints() {
		$breakpoints_config = Plugin::$instance->breakpoints->get_breakpoints_config();
		$active_breakpoints = Plugin::$instance->breakpoints->get_active_breakpoints();

		$breakpoints = [];

		foreach ( array_keys( $active_breakpoints ) as $breakpoint_label ) {
			$breakpoints[ $breakpoint_label ] = $breakpoints_config[ $breakpoint_label ];
		}

		return $breakpoints;
	}

	private function register_frontend_scripts() {
		$suffix = ( Utils::is_script_debug() || Utils::is_elementor_tests() ) ? '' : '.min';

		wp_register_script(
			self::HANDLE_MOTION_JS,
			ELEMENTOR_ASSETS_URL . 'lib/motion/motion' . $suffix . '.js',
			[],
			'11.13.5',
			true
		);

		wp_register_script(
			self::HANDLE_SHARED_UTILS,
			$this->get_js_assets_url( 'interactions-shared-utils' ),
			[ self::HANDLE_MOTION_JS ],
			'1.0.0',
			true
		);

		wp_register_script(
			self::HANDLE_FRONTEND,
			$this->get_js_assets_url( 'interactions' ),
			[ self::HANDLE_MOTION_JS, self::HANDLE_SHARED_UTILS ],
			'1.0.0',
			true
		);

		wp_register_script(
			self::HANDLE_EDITOR,
			$this->get_js_assets_url( 'editor-interactions' ),
			[ self::HANDLE_MOTION_JS, self::HANDLE_SHARED_UTILS ],
			'1.0.0',
			true
		);
	}

	public function enqueue_editor_scripts() {
		wp_add_inline_script(
			'elementor-common',
			'window.' . self::JS_CONFIG_OBJECT . ' = ' . wp_json_encode( $this->get_config() ) . ';',
			'before'
		);
	}

	public function enqueue_preview_scripts() {
		wp_enqueue_script( self::HANDLE_SHARED_UTILS );
		// Ensure motion-js and editor-interactions handler are available in preview iframe
		wp_enqueue_script( self::HANDLE_MOTION_JS );
		wp_enqueue_script( self::HANDLE_EDITOR );

		wp_localize_script(
			self::HANDLE_EDITOR,
			self::JS_CONFIG_OBJECT,
			$this->get_config()
		);
	}
}
