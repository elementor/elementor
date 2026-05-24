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
		add_action( 'elementor/editor/after_enqueue_scripts', [ $this, 'enqueue_assets' ], PHP_INT_MAX);

		return $this;
	}

	public function enqueue_assets() {
		wp_enqueue_script(
			self::MODULE_NAME,
			$this->get_js_assets_url( self::MODULE_NAME ),
			[],
			ELEMENTOR_VERSION,
			true
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
	}
}
