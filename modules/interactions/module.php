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

	private $animations;

	private function get_animations() {
		if ( ! $this->animations ) {
			$this->animations = new Animations();
		}

		return $this->animations;
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

		add_filter( 'elementor/document/save/data', fn ( $data ) => $this->sanitize_document_data( $data ), 10, 1 );
	}

	private function get_config() {
		return [
			'constants' => $this->get_animations()->defaults(),
			'animationOptions' => $this->get_animations()->list(),
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

	private function is_valid_animation_id( $animation_id ) {
		static $valid_ids = null;

		if ( null === $valid_ids ) {
			$valid_ids = array_column( $this->get_animations()->list(), 'value' );
		}

		if ( ! is_string( $animation_id ) || empty( $animation_id ) ) {
			return false;
		}

		$sanitized_id = sanitize_text_field( $animation_id );

		if ( $sanitized_id !== $animation_id ) {
			return false;
		}

		return in_array( $animation_id, $valid_ids, true );
	}

	private function sanitize_interactions( $interactions ) {
		$sanitized = [
			'items' => [],
			'version' => 1,
		];

		if ( ! is_array( $interactions ) || ! isset( $interactions['items'] ) ) {
			return $sanitized;
		}

		foreach ( $interactions['items'] as $interaction ) {
			$animation_id = null;

			if ( is_string( $interaction ) ) {
				$animation_id = $interaction;
			} elseif ( is_array( $interaction ) && isset( $interaction['animation']['animation_id'] ) ) {
				$animation_id = $interaction['animation']['animation_id'];
			}

			if ( $animation_id && $this->is_valid_animation_id( $animation_id ) ) {
				$sanitized['items'][] = $interaction;
			}
		}

		return $sanitized;
	}

	private function sanitize_elements_interactions( $elements ) {
		if ( ! is_array( $elements ) ) {
			return $elements;
		}

		foreach ( $elements as &$element ) {
			if ( isset( $element['settings']['interactions'] ) ) {
				$element['settings']['interactions'] = $this->sanitize_interactions( $element['settings']['interactions'] );
			}

			if ( isset( $element['elements'] ) && is_array( $element['elements'] ) ) {
				$element['elements'] = $this->sanitize_elements_interactions( $element['elements'] );
			}
		}

		return $elements;
	}

	private function sanitize_document_data( $data ) {
		if ( isset( $data['elements'] ) && is_array( $data['elements'] ) ) {
			$data['elements'] = $this->sanitize_elements_interactions( $data['elements'] );
		}

		return $data;
	}
}
