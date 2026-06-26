<?php

namespace Elementor\Modules\AssetsManager;

use Elementor\Plugin;
use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Experiments\Manager as Experiments_Manager;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Module extends BaseModule {
	const MODULE_NAME = 'assets-manager';
	const EXPERIMENT_NAME = 'e_assets_manager';

	private $style_assets;
	private $script_assets;

	public function get_name() {
		return self::MODULE_NAME;
	}

	public static function get_experimental_data() {
		return [
			'name' => self::EXPERIMENT_NAME,
			'title' => esc_html__( 'Dynamic Assets Management', 'elementor' ),
			'description' => esc_html__( 'Enable dynamic assets management (JS and CSS lazy-loading).', 'elementor' ),
			'hidden' => true,
			'default' => Experiments_Manager::STATE_INACTIVE,
			'release_status' => Experiments_Manager::RELEASE_STATUS_DEV,
		];
	}

	public function is_experiment_active() {
		return Plugin::$instance->experiments->is_feature_active( self::EXPERIMENT_NAME );
	}

	public function __construct() {
		parent::__construct();

		if ( ! $this->is_experiment_active() ) {
			return;
		}

		$this->init();

		$this->register_hooks();
	}

	private function init() {
		$this->style_assets = new Assets();
		$this->script_assets = new Assets();

		return $this;
	}

	private function register_hooks() {
		add_action( 'elementor/editor/after_enqueue_styles', [ $this, 'manage_style_assets' ], PHP_INT_MAX );
		add_action( 'elementor/editor/after_enqueue_scripts', [ $this, 'manage_script_assets' ], PHP_INT_MAX );

		add_action( 'elementor/preview/enqueue_styles', [ $this, 'manage_style_assets' ], PHP_INT_MAX );
		add_action( 'elementor/preview/enqueue_scripts', [ $this, 'manage_script_assets' ], PHP_INT_MAX );

		add_action( 'elementor/editor/footer', [ $this, 'manage_assets' ], PHP_INT_MAX );

		return $this;
	}

	public function manage_style_assets() {
		do_action( 'elementor/assets-manager/register_styles', $this->style_assets );

		foreach ( array_keys( $this->style_assets->assets_map() ) as $handle ) {
			wp_dequeue_style( $handle );
		}

		return $this;
	}

	public function manage_script_assets() {
		do_action( 'elementor/assets-manager/register_scripts', $this->script_assets );

		foreach ( array_keys( $this->script_assets->assets_map() ) as $handle ) {
			wp_dequeue_script( $handle );
		}

		return $this;
	}

	public function manage_assets() {
		wp_enqueue_script(
			self::MODULE_NAME,
			$this->get_js_assets_url( self::MODULE_NAME ),
			[],
			ELEMENTOR_VERSION,
			[
				'in_footer' => true,
				'strategy' => 'defer',
			]
		);

		wp_localize_script(
			self::MODULE_NAME,
			'elementorAssetsManager',
			[
				'styles' => [
					'map' => $this->style_assets->assets_map(),
					'priority_queue' => $this->style_assets->priority_queue(),
				],
				'scripts' => [
					'map' => $this->script_assets->assets_map(),
					'priority_queue' => $this->script_assets->priority_queue(),
				],
			]
		);

		return $this;
	}
}
