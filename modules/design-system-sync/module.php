<?php

namespace Elementor\Modules\DesignSystemSync;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Modules\DesignSystemSync\Classes\Stylesheet_Manager;
use Elementor\Modules\DesignSystemSync\Classes\Controller;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Module extends BaseModule {
	const MODULE_NAME = 'design-system-sync';
	public static function get_v3_sync_id( string $label ): string {
		return 'v4-' . strtolower( $label );
	}

	public function get_name() {
		return self::MODULE_NAME;
	}

	public function __construct() {
		parent::__construct();

		$this->register_hooks();
	}

	private function register_hooks() {
		( new Classes\Global_Colors_Extension() )->register_hooks();
		( new Classes\Global_Typography_Extension() )->register_hooks();
		( new Controller() )->register_hooks();

		add_action( 'elementor/controls/register', [ $this, 'register_controls' ] );
		add_action( 'elementor/editor/after_enqueue_scripts', [ $this, 'enqueue_editor_scripts' ] );
		add_action( 'elementor/editor/after_enqueue_styles', [ $this, 'enqueue_editor_styles' ] );
		add_action( 'elementor/global_classes/update', [ $this, 'clear_classes_cache' ] );
		add_action( 'wp_enqueue_scripts', [ $this, 'enqueue_sync_stylesheet' ] );
	}

	public function register_controls( $controls_manager ) {
		require_once __DIR__ . '/controls/v4-color-variable-list.php';
		require_once __DIR__ . '/controls/v4-typography-list.php';

		$controls_manager->register( new Controls\V4_Color_Variable_List() );
		$controls_manager->register( new Controls\V4_Typography_List() );
	}

	public function enqueue_editor_scripts() {
		wp_enqueue_script(
			'elementor-design-system-sync-editor',
			$this->get_js_assets_url( 'design-system-sync' ),
			[],
			ELEMENTOR_VERSION,
			true
		);
	}

	public function enqueue_editor_styles() {
		wp_enqueue_style(
			'elementor-design-system-sync-editor',
			$this->get_css_assets_url( 'modules/design-system-sync/design-system-sync' ),
			[],
			ELEMENTOR_VERSION
		);
	}

	public function clear_classes_cache() {
		Classes\Classes_Provider::clear_cache();
	}

	public function enqueue_sync_stylesheet() {
		( new Stylesheet_Manager() )->enqueue();
	}
}
