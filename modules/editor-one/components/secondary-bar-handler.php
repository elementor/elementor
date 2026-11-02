<?php

namespace Elementor\Modules\EditorOne\Components;

use Elementor\Core\Utils\Assets_Config_Provider;
use Elementor\Modules\EditorOne\Classes\Menu_Data_Provider;
use Elementor\Modules\EditorOne\Classes\Secondary_Bar;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Secondary_Bar_Handler {

	const PACKAGE_NAME = 'editor-one-secondary-bar';

	const SCRIPT_HANDLE = 'elementor-v2-' . self::PACKAGE_NAME;

	private Admin_Flow_Handler $admin_flow_handler;

	private Secondary_Bar $secondary_bar;

	private ?array $bar = null;

	public function __construct( Admin_Flow_Handler $admin_flow_handler, ?Secondary_Bar $secondary_bar = null ) {
		$this->admin_flow_handler = $admin_flow_handler;
		$this->secondary_bar = $secondary_bar ?? new Secondary_Bar();

		add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_assets' ], 20 );
		add_action( 'in_admin_header', [ $this, 'render_container' ], 20 );
		add_filter( 'admin_body_class', [ $this, 'add_body_class' ] );
	}

	public function enqueue_assets(): void {
		if ( empty( $this->get_bar() ) ) {
			return;
		}

		$min_suffix = Utils::is_script_debug() ? '' : '.min';

		wp_enqueue_style(
			'elementor-editor-one-secondary-bar',
			ELEMENTOR_ASSETS_URL . 'css/modules/editor-one/secondary-bar' . $min_suffix . '.css',
			[],
			ELEMENTOR_VERSION
		);

		$this->register_package();
		wp_enqueue_script( self::SCRIPT_HANDLE );
		wp_localize_script( self::SCRIPT_HANDLE, 'editorOneSecondaryBarConfig', $this->get_bar() );
		wp_set_script_translations( self::SCRIPT_HANDLE, 'elementor' );
	}

	public function render_container(): void {
		if ( empty( $this->get_bar() ) ) {
			return;
		}

		echo '<div id="editor-one-secondary-bar"></div>';
	}

	public function add_body_class( $classes ): string {
		$classes = is_string( $classes ) ? $classes : '';

		if ( empty( $this->get_bar() ) ) {
			return $classes;
		}

		return $classes . ' e-has-secondary-bar';
	}

	private function register_package(): void {
		$min_suffix = Utils::is_script_debug() ? '' : '.min';
		$package = self::PACKAGE_NAME;

		$assets_config_provider = ( new Assets_Config_Provider() )
			->set_path_resolver( function ( $name ) {
				return ELEMENTOR_ASSETS_PATH . "js/packages/{$name}/{$name}.asset.php";
			} );

		$config = $assets_config_provider->load( $package )->get( $package );

		if ( ! $config ) {
			return;
		}

		wp_register_script(
			$config['handle'],
			ELEMENTOR_ASSETS_URL . "js/packages/{$package}/{$package}{$min_suffix}.js",
			$config['deps'],
			ELEMENTOR_VERSION,
			true
		);
	}

	private function get_bar(): array {
		if ( null !== $this->bar ) {
			return $this->bar;
		}

		$this->bar = $this->secondary_bar->get_bar(
			$this->admin_flow_handler->get_map(),
			Menu_Data_Provider::instance(),
			$this->admin_flow_handler->get_active_state()
		);

		return $this->bar;
	}
}
