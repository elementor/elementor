<?php

namespace Elementor\Modules\EditorOne\Components;

use Elementor\Core\Utils\Assets_Config_Provider;
use Elementor\Modules\EditorOne\Classes\Menu_Data_Provider;
use Elementor\Modules\EditorOne\Classes\Secondary_Bar;
use Elementor\Plugin;
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
		add_action( 'in_admin_header', [ $this, 'register_container' ] );
	}

	public function enqueue_assets(): void {
		$bar = $this->get_bar();

		if ( empty( $bar ) ) {
			return;
		}

		$config = $this->get_package_config();
		$min_suffix = Utils::is_script_debug() ? '' : '.min';
		$package = self::PACKAGE_NAME;

		wp_enqueue_script(
			$config['handle'],
			ELEMENTOR_ASSETS_URL . "js/packages/{$package}/{$package}{$min_suffix}.js",
			array_merge( $config['deps'], [ 'elementor-common' ] ),
			ELEMENTOR_VERSION,
			true
		);

		wp_localize_script( self::SCRIPT_HANDLE, 'editorOneSecondaryBarConfig', array_merge( $bar, [
			'is_finder_available' => $this->is_finder_available(),
		] ) );
		wp_set_script_translations( self::SCRIPT_HANDLE, 'elementor' );
	}

	public function register_container(): void {
		// Registered this late so `remove_all_actions( 'admin_notices' )` on `admin_init` doesn't drop it.
		add_action( 'admin_notices', [ $this, 'render_container' ], PHP_INT_MIN );
	}

	public function render_container(): void {
		if ( empty( $this->get_bar() ) ) {
			return;
		}

		echo '<div id="editor-one-secondary-bar"></div>';
	}

	protected function get_package_config(): ?array {
		$package = self::PACKAGE_NAME;

		$assets_config_provider = ( new Assets_Config_Provider() )
			->set_path_resolver( function ( $name ) {
				return ELEMENTOR_ASSETS_PATH . "js/packages/{$name}/{$name}.asset.php";
			} );

		return $assets_config_provider->load( $package )->get( $package );
	}

	private function is_finder_available(): bool {
		return isset( Plugin::$instance->common ) && (bool) Plugin::$instance->common->get_component( 'finder' );
	}

	private function get_bar(): array {
		if ( null !== $this->bar ) {
			return $this->bar;
		}

		$bar = $this->secondary_bar->get_bar(
			$this->admin_flow_handler->get_map(),
			Menu_Data_Provider::instance(),
			$this->admin_flow_handler->get_active_state()
		);

		$this->bar = ! empty( $bar ) && $this->get_package_config() ? $bar : [];

		return $this->bar;
	}
}
