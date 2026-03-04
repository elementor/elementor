<?php

namespace Elementor\Modules\WidgetCreation;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Experiments\Manager as ExperimentsManager;
use Elementor\Core\Utils\Hints;
use Elementor\Modules\WidgetCreation\Rest_Api;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Module extends BaseModule {
	const MODULE_NAME = 'widget-creation';
	const EXPERIMENT_NAME = 'e_widget_creation';

	const ANGIE_PLUGIN_SLUG = 'angie';
	const ANGIE_PLUGIN_PATH = 'angie/angie.php';

	const PACKAGES = [
		'editor-widget-creation',
	];

	public function get_name() {
		return self::MODULE_NAME;
	}

	public static function get_experimental_data(): array {
		return [
			'name' => self::EXPERIMENT_NAME,
			'title' => esc_html__( 'Widget Creation', 'elementor' ),
			'description' => esc_html__( 'Promote widget creation with Angie plugin.', 'elementor' ),
			'hidden' => true,
			'default' => ExperimentsManager::STATE_INACTIVE,
			'release_status' => ExperimentsManager::RELEASE_STATUS_ALPHA,
		];
	}

	public function __construct() {
		parent::__construct();

		add_filter( 'elementor/editor/v2/packages', fn( $packages ) => $this->add_packages( $packages ) );

		( new Rest_Api() )->register_hooks();
	}

	private function add_packages( array $packages ): array {
		return array_merge( $packages, self::PACKAGES );
	}

	public static function is_angie_installed(): bool {
		return Hints::is_plugin_installed( self::ANGIE_PLUGIN_SLUG );
	}

	public static function is_angie_active(): bool {
		return Hints::is_plugin_active( self::ANGIE_PLUGIN_SLUG );
	}
}
