<?php

namespace Elementor\Modules\AtomicOptIn;

use Elementor\Core\Isolation\Elementor_Adapter;
use Elementor\Core\Isolation\Elementor_Adapter_Interface;
use Elementor\Core\Utils\Assets_Config_Provider;
use Elementor\Modules\ElementorCounter\Module as Elementor_Counter;
use Elementor\Core\Upgrade\Manager as Upgrade_Manager;
use Elementor\Utils;

class WelcomeScreen {
	const PACKAGE_NAME = 'v4-activation-modal';

	private Elementor_Adapter_Interface $elementor_adapter;

	public function __construct() {
		$this->elementor_adapter = new Elementor_Adapter();
	}

	public function init() {
		add_action( 'elementor/editor/before_enqueue_scripts', [ $this, 'maybe_enqueue_welcome_popover' ] );
	}

	public function maybe_enqueue_welcome_popover(): void {
		if ( $this->is_first_or_second_editor_visit() ) {
			return;
		}

		if ( $this->has_welcome_popover_been_displayed() ) {
			return;
		}

		if ( Upgrade_Manager::is_new_installation() ) {
			return;
		}

		$this->register_package();
		wp_enqueue_script( 'elementor-v2-' . self::PACKAGE_NAME );
		wp_set_script_translations( 'elementor-v2-' . self::PACKAGE_NAME, 'elementor' );
		$this->set_welcome_popover_as_displayed();
	}

	private function is_first_or_second_editor_visit(): bool {
		if ( ! $this->elementor_adapter ) {
			return false;
		}

		$editor_visit_count = $this->elementor_adapter->get_count( Elementor_Counter::EDITOR_COUNTER_KEY );
		return $editor_visit_count < 3;
	}

	private function has_welcome_popover_been_displayed(): bool {
		return get_user_meta( $this->get_current_user_id(), Module::WELCOME_POPOVER_DISPLAYED_OPTION, true );
	}

	private function set_welcome_popover_as_displayed(): void {
		update_user_meta( $this->get_current_user_id(), Module::WELCOME_POPOVER_DISPLAYED_OPTION, true );
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

	private function get_current_user_id(): int {
		$current_user = wp_get_current_user();
		return $current_user->ID ?? 0;
	}
}
