<?php
namespace Elementor\Modules\Interactions;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\AtomicWidgets\Module as AtomicWidgetsModule;
use Elementor\Plugin;


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

	private function get_presets() {
		if ( ! $this->preset_animations ) {
			$this->preset_animations = new Presets();
		}

		return $this->preset_animations;
	}

	public static function get_experimental_data() {
		return [
			'name' => self::EXPERIMENT_NAME,
			'title' => esc_html__( 'Interactions', 'elementor' ),
			'description' => esc_html__( 'Enable element interactions.', 'elementor' ),
			'hidden' => true,
			'default' => Experiments_Manager::STATE_INACTIVE,
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

		add_filter( 'elementor/document/save/data',
			/**
			 * @throws \Exception
			 */
			function( $data, $document ) {
				$validation = new Validation( $this->get_presets() );
				$document_after_sanitization = $validation->sanitize( $data );
				$validation->validate();

				return $document_after_sanitization;
			},
		10, 2 );

		add_filter( 'elementor/document/save/data', function( $data, $document ) {
			return ( new Parser( $document->get_main_id() ) )->assign_interaction_ids( $data );
		}, 11, 2 );

		// add_filter( 'elementor/document/save/data', function( $data ) {
		// 	return ( new Prop_Type_Adapter() )->interaction_to_prop_type( $data, $document );
		// }, 12, 2 );
		
		add_filter( 'elementor/frontend/builder_content_data', function( $data ) {
			return ( new Prop_Type_Adapter() )->prop_type_to_interaction( $data );
		}, 10 );

		add_filter( 'elementor/document/get_elements', function( $data ) {
			return ( new Prop_Type_Adapter() )->prop_type_to_interaction( $data );
		}, 10 );

		// add_action( 'elementor/document/after_save', function( $document ) {
		// 	$post_id = $document->get_main_id();
		// 	$data = get_post_meta( $post_id, '_elementor_data', true );
			
		// 	error_log( '=== ACTUAL DATABASE CONTENT ===' );
		// 	error_log( 'Post ID: ' . $post_id );
			
		// 	if ( is_string( $data ) ) {
		// 		$decoded = json_decode( $data, true );
		// 		if ( is_array( $decoded ) ) {
		// 			foreach ( $decoded as $index => $element ) {
		// 				if ( isset( $element['interactions'] ) && ! empty( $element['interactions'] ) ) {
		// 					$interactions_data = is_string( $element['interactions'] ) ? $element['interactions'] : json_encode( $element['interactions'] );
		// 					error_log( "DB Element [$index] interactions: " . $interactions_data );
		// 				}
						
		// 				// Check nested
		// 				if ( isset( $element['elements'] ) && is_array( $element['elements'] ) ) {
		// 					foreach ( $element['elements'] as $nested_index => $nested ) {
		// 						if ( isset( $nested['interactions'] ) && ! empty( $nested['interactions'] ) ) {
		// 							$interactions_data = is_string( $nested['interactions'] ) ? $nested['interactions'] : json_encode( $nested['interactions'] );
		// 							error_log( "DB Nested Element [$index][$nested_index] interactions: " . $interactions_data );
		// 						}
		// 					}
		// 				}
		// 			}
		// 		}
		// 	}
		// }, 999 );
	}

	private function get_config() {
		return [
			'constants' => $this->get_presets()->defaults(),
			'animationOptions' => $this->get_presets()->list(),
		];
	}

	private function register_frontend_scripts() {
		wp_register_script(
			'motion-js',
			ELEMENTOR_ASSETS_URL . 'lib/motion/motion.js',
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
}
