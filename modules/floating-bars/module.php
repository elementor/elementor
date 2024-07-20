<?php

namespace Elementor\Modules\FloatingBars;

use Elementor\Controls_Manager;
use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Experiments\Manager;
use Elementor\Modules\FloatingBars\Base\Widget_Floating_Bars_Base;
use Elementor\Modules\FloatingButtons\Documents\Floating_Buttons;
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

	public function get_widgets(): array {
		return [
			'Floating_Bars_Var_1',
		];
	}

	public function __construct() {
		parent::__construct();

		if ( Floating_Buttons::is_creating_floating_buttons_page() || Floating_Buttons::is_editing_existing_floating_buttons_page() ) {
			Controls_Manager::add_tab(
				Widget_Floating_Bars_Base::TAB_ADVANCED,
				esc_html__( 'Advanced', 'elementor' )
			);
		}
	}
}
