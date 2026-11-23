<?php

namespace Elementor\Modules\WidgetCreation;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Utils\Hints;
use Elementor\Modules\AtomicWidgets\Module as Atomic_Widgets_Module;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Module extends BaseModule {
	const EXPERIMENT_NAME = Atomic_Widgets_Module::EXPERIMENT_NAME;
	const MODULE_NAME = 'widget-creation';

	const PACKAGES = [
		'editor-widget-creation',
	];

	public function get_name() {
		return self::MODULE_NAME;
	}

	public static function is_angie_plugin_active(): bool {
		return Hints::is_plugin_active( 'angie' );
	}

	public static function can_create_widget(): bool {
		return self::is_angie_plugin_active() && current_user_can( 'manage_options' );
	}

	public function __construct() {
		parent::__construct();

		add_filter( 'elementor/editor/v2/packages', fn( $packages ) => $this->add_packages( $packages ) );
		add_filter( 'elementor/editor/localize_settings', fn( $settings ) => $this->add_localize_settings( $settings ) );
	}

	private function add_packages( array $packages ): array {
		if ( self::can_create_widget() ) {
			$packages = array_merge( $packages, self::PACKAGES );
		}

		return array_values( array_unique( $packages ) );
	}

	private function add_localize_settings( array $settings ): array {
		$settings['widgetCreation'] = [
			'isAngiePluginActive' => self::is_angie_plugin_active(),
			'canCreateWidget' => self::can_create_widget(),
		];

		return $settings;
	}
}
