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

	const TRIGGERS = [ 'load', 'scroll-in', 'scroll-out' ];
	const EFFECTS = [ 'fade', 'slide', 'scale' ];
	const TYPES = [ 'in', 'out' ];
	const DIRECTIONS = [ 'left', 'right', 'bottom', 'top' ];
	const DEFAULT_DURATION = 0.3;
	const DEFAULT_DELAY = 0;
	const SLIDE_DISTANCE = 100;
	const SCALE_START = 0.5;
	const EASING = 'ease-in-out';

	public function get_name() {
		return self::MODULE_NAME;
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
		add_action( 'elementor/editor/after_enqueue_scripts', [ $this, 'enqueue_editor_scripts' ] );
		add_action( 'elementor/editor/before_enqueue_scripts', fn () => $this->enqueue_interactions() );
		add_action( 'elementor/frontend/before_enqueue_scripts', fn () => $this->enqueue_interactions() );
	}

	private function get_label( $key, $value ) {
		$special_labels = [
			'trigger' => [
				'load' => 'Page Load',
				'scroll-in' => 'Scroll Into View',
				'scroll-out' => 'Scroll Out of View',
			],
			'direction' => [
				'top' => 'Up',
			],
		];

		if ( isset( $special_labels[ $key ][ $value ] ) ) {
			return __( $special_labels[ $key ][ $value ], 'elementor' );
		}

		$label = ucwords( str_replace( '-', ' ', $value ) );

		return __( $label, 'elementor' );
	}

	private function generate_animation_options() {
		$options = [
			[
			'value' => '',
			'label' => __( 'Select animation...', 'elementor' )
			]
		];

		foreach ( self::TRIGGERS as $trigger ) {
			foreach ( self::EFFECTS as $effect ) {
				foreach ( self::TYPES as $type ) {
					foreach ( self::DIRECTIONS as $direction ) {
						$value = "{$effect}-{$type}-{$direction}-{$trigger}";
						$label = sprintf(
							'%s - %s %s %s',
							$this->get_label( 'trigger', $trigger ),
							$this->get_label( 'effect', $effect ),
							$this->get_label( 'type', $type ),
							$this->get_label( 'direction', $direction )
						);
						$options[] = [
							'value' => $value,
							'label' => $label
						];
					}

					$value = "{$effect}-{$type}-{$trigger}";
					$label = sprintf(
						'%s - %s %s',
						$this->get_label( 'trigger', $trigger ),
						$this->get_label( 'effect', $effect ),
						$this->get_label( 'type', $type )
					);
					$options[] = [
						'value' => $value,
						'label' => $label
					];
				}
			}
		}

		return $options;
	}

	private function get_config() {
		return [
			'constants' => [
				'defaultDuration' => self::DEFAULT_DURATION,
				'defaultDelay' => self::DEFAULT_DELAY,
				'slideDistance' => self::SLIDE_DISTANCE,
				'scaleStart' => self::SCALE_START,
				'easing' => self::EASING,
			],
			'animationOptions' => $this->generate_animation_options(),
		];
	}

	/**
	 * Register frontend scripts for interactions.
	 *
	 * @return void
	 */
	private function register_frontend_scripts() {
		wp_register_script(
			'motion-js',
			ELEMENTOR_URL . 'assets/lib/motion.js',
			[],
			'11.13.5',
			true
		);

		wp_register_script(
			'elementor-interactions',
			ELEMENTOR_URL . 'modules/interactions/assets/js/interactions.js',
			[ 'motion-js' ],
			'1.0.0',
			true
		);
	}

	/**
	 * Enqueue interactions scripts.
	 *
	 * @return void
	 */
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
}
