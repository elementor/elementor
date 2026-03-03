<?php

namespace Elementor\Modules\AngieEntrypoints;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Experiments\Manager as ExperimentsManager;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Module extends BaseModule {
	const MODULE_NAME = 'angie-entrypoints';
	const EXPERIMENT_NAME = 'e_angie_entrypoints';
	const PLUGIN_SLUG = 'angie';
	const ANGIE_PLUGIN_PATH = 'angie/angie.php';

	public function get_name() {
		return self::MODULE_NAME;
	}

	public static function get_experimental_data(): array {
		return [
			'name' => self::EXPERIMENT_NAME,
			'title' => esc_html__( 'Angie Entrypoints', 'elementor' ),
			'description' => esc_html__( 'Promote and integrate with Angie plugin via various entrypoints.', 'elementor' ),
			'hidden' => true,
			'default' => ExperimentsManager::STATE_INACTIVE,
			'release_status' => ExperimentsManager::RELEASE_STATUS_ALPHA,
		];
	}
}
