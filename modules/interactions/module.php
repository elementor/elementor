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

		add_action( 'elementor/editor/after_enqueue_scripts', [ $this, 'enqueue_editor_scripts' ] );
		add_action( 'wp_enqueue_scripts', [ $this, 'enqueue_frontend_scripts' ] );
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
		$options = [ [ 'value' => '', 'label' => __( 'Select animation...', 'elementor' ) ] ];

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
						$options[] = [ 'value' => $value, 'label' => $label ];
					}

					$value = "{$effect}-{$type}-{$trigger}";
					$label = sprintf(
						'%s - %s %s',
						$this->get_label( 'trigger', $trigger ),
						$this->get_label( 'effect', $effect ),
						$this->get_label( 'type', $type )
					);
					$options[] = [ 'value' => $value, 'label' => $label ];
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

	public function enqueue_editor_scripts() {
		wp_add_inline_script(
			'elementor-common',
			'window.ElementorInteractionsConfig = ' . wp_json_encode( $this->get_config() ) . ';',
			'before'
		);
	}

	public function enqueue_frontend_scripts() {
		if ( wp_script_is( 'interactions', 'enqueued' ) || wp_script_is( 'interactions', 'registered' ) ) {
			wp_localize_script(
				'interactions',
				'ElementorInteractionsConfig',
				$this->get_config()
			);
		}
	}
}
