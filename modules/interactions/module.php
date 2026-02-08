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
			$this->frontend_handler = new Interactions_Frontend_Handler();
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
		add_action( 'elementor/frontend/before_enqueue_scripts', fn () => $this->enqueue_interactions() );
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
		// add_filter( 'elementor/document/save/data', function( $data, $document ) {
		// 	return $this->wrap_interactions_for_db( $data );
		// }, 12, 2 ); // Priority 12 = after validation (10) and ID assignment (11)

		// Unwrap data AFTER loading from DB for frontend/editor
		// add_filter( 'elementor/document/load/data', function( $elements, $document ) {
		// 	return $this->process_elements_unwrap( $elements );
		// }, 10, 2 );
	}

	private function get_config() {
		return [
			'constants' => $this->get_presets()->defaults(),
			'animationOptions' => $this->get_presets()->list(),
		];
	}

	private function register_frontend_scripts() {
		$suffix = ( Utils::is_script_debug() || Utils::is_elementor_tests() ) ? '' : '.min';

		wp_register_script(
			'motion-js',
			ELEMENTOR_ASSETS_URL . 'lib/motion/motion' . $suffix . '.js',
			[],
			'11.13.5',
			true
		);

		wp_register_script(
			'elementor-interactions',
			$this->get_js_assets_url( 'interactions' ),
			[ 'motion-js' ],
			'1.0.0',
			true
		);

		wp_register_script(
			'elementor-editor-interactions',
			$this->get_js_assets_url( 'editor-interactions' ),
			[ 'motion-js' ],
			'1.0.0',
			true
		);
	}

	public function enqueue_interactions(): void {
		wp_enqueue_script( 'motion-js' );
		wp_enqueue_script( 'elementor-interactions' );

		wp_localize_script(
			'elementor-interactions',
			'ElementorInteractionsConfig',
			$this->get_config()
		);
	}

	public function enqueue_editor_scripts() {
		wp_add_inline_script(
			'elementor-common',
			'window.ElementorInteractionsConfig = ' . wp_json_encode( $this->get_config() ) . ';',
			'before'
		);
	}

	public function enqueue_preview_scripts() {
		// Ensure motion-js and editor-interactions handler are available in preview iframe
		wp_enqueue_script( 'motion-js' );
		wp_enqueue_script( 'elementor-editor-interactions' );

		wp_localize_script(
			'elementor-editor-interactions',
			'ElementorInteractionsConfig',
			$this->get_config()
		);
	}

	private function wrap_interactions_for_db( $data ) {
		if ( isset( $data['elements'] ) && is_array( $data['elements'] ) ) {
			$data['elements'] = $this->process_elements_wrap( $data['elements'] );
		}
		return $data;
	}

	private function unwrap_interactions_for_frontend( $data ) {
		if ( isset( $data['elements'] ) && is_array( $data['elements'] ) ) {
			$data['elements'] = $this->process_elements_unwrap( $data['elements'] );
		}
		return $data;
	}

	private function process_elements_wrap( $elements ) {
		foreach ( $elements as &$element ) {
			if ( isset( $element['interactions'] ) ) {
				$element['interactions'] = Adapter::wrap_for_db( $element['interactions'] );
			}
			if ( isset( $element['elements'] ) && is_array( $element['elements'] ) ) {
				$element['elements'] = $this->process_elements_wrap( $element['elements'] );
			}
		}
		return $elements;
	}

	private function process_elements_unwrap( $elements ) {
		foreach ( $elements as &$element ) {
			if ( isset( $element['interactions'] ) ) {
				$element['interactions'] = Adapter::unwrap_for_frontend( $element['interactions'] );
			}
			if ( isset( $element['elements'] ) && is_array( $element['elements'] ) ) {
				$element['elements'] = $this->process_elements_unwrap( $element['elements'] );
			}
		}
		return $elements;
	}
}
