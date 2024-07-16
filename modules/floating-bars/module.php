<?php

namespace Elementor\Modules\FloatingBars;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Experiments\Manager;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Module extends BaseModule {

	const EXPERIMENT_NAME = 'floating-bars';

	public static function is_active(): bool {
		return Plugin::$instance->experiments->is_feature_active( static::EXPERIMENT_NAME );
	}

	public function get_name(): string {
		return static::EXPERIMENT_NAME;
	}

	public static function get_experimental_data(): array {
		return [
			'name' => static::EXPERIMENT_NAME,
			'title' => esc_html__( 'Floating Bars', 'elementor' ),
			'description' => esc_html__( 'Boost visitor engagement with Floating Bars.', 'elementor' ),
			Manager::TYPE_HIDDEN => true,
			'release_status' => Manager::RELEASE_STATUS_DEV,
			'default' => Manager::STATE_INACTIVE,
			'dependencies' => [
				\Elementor\Modules\FloatingButtons\Module::EXPERIMENT_NAME,
			],
		];
	}
}
