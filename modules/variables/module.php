<?php

namespace Elementor\Modules\Variables;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Experiments\Manager as ExperimentsManager;
use Elementor\Modules\AtomicWidgets\Module as AtomicWidgetsModule;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseModule {
	const MODULE_NAME = 'e-variables';
	const EXPERIMENT_NAME = 'e_variables';
	const PACKAGE = [
		'editor-global-variables'
	];

	public function get_name() {
		return self::MODULE_NAME;
	}

	public static function get_experimental_data(): array {
		return [
			'name' => self::EXPERIMENT_NAME,
			'title' => esc_html__( 'Variables', 'elementor' ),
			'description' => esc_html__( 'Enable variables. (For this feature to work - Atomic Widgets must be active)', 'elementor' ),
			'hidden' => true,
			'default' => ExperimentsManager::STATE_INACTIVE,
			'release_status' => ExperimentsManager::RELEASE_STATUS_ALPHA,
		];
	}

	private function hooks() {
		return new Hooks();
	}

	public function __construct() {
		parent::__construct();

		if ( ! $this->is_experiment_active() ) {
			return;
		}

		add_filter( 'elementor/editor/v2/packages', fn( $packages ) => $this->add_packages( $packages ) );

		$this->hooks()
			->register_styles_transformers()
			->filter_for_style_schema();
	}

	private function is_experiment_active(): bool {
		return Plugin::$instance->experiments->is_feature_active( self::EXPERIMENT_NAME )
			&& Plugin::$instance->experiments->is_feature_active( AtomicWidgetsModule::EXPERIMENT_NAME );
	}

	private function add_packages( $packages ) {
		if ( ! current_user_can( 'manage_options' ) ) {
			return $packages;
		}

		return array_merge( $packages, self::PACKAGE );
	}
}
