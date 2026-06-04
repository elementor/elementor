<?php

namespace Elementor\Modules\Promotions\Widgets;

use Elementor\Core\Utils\Assets_Config_Provider;
use Elementor\Includes\EditorAssetsAPI;
use Elementor\Modules\AtomicWidgets\Module as AtomicWidgetsModule;
use Elementor\Modules\Promotions\Data\Birthday_Promotion_Actions;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Birthday_Easter_Egg_Promotion {
	const WIDGET_NAME = 'e-birthday-easter-egg';
	const PACKAGE_NAME = 'birthday-easter-egg-modal';
	const SCRIPT_HANDLE = 'elementor-v2-birthday-easter-egg-modal';
	const LOTTIE_DATA_TRANSIENT_KEY = '_elementor_10th_bday_lottie_data';

	private EditorAssetsAPI $editor_assets_api;
	private Birthday_Promotion_Actions $birthday_promotion_actions;
	private array $data = [];
	private ?array $lottie_data = null;

	public function __construct( $force_request_assets = false ) {
		$this->init_data( $force_request_assets );
		$this->birthday_promotion_actions = new Birthday_Promotion_Actions();
	}

	public function register(): void {
		if ( ! $this->should_show_promotion() ) {
			return;
		}

		add_filter( 'elementor/editor/localize_settings', fn( $settings ) => $this->add_promotion_data( $settings ) );
		add_action( 'elementor/editor/before_enqueue_scripts', fn() => $this->maybe_enqueue_app() );
		$this->birthday_promotion_actions->register_ajax_actions();
	}

	private function add_promotion_data( array $settings ): array {
		$settings['birthdayEasterEggWidgets'] = $this->get_widgets();
		$settings['birthdayEasterEggModal'] = $this->get_modal_config();

		return $settings;
	}

	private function maybe_enqueue_app(): void {
		$this->register_package();
		wp_enqueue_script( self::SCRIPT_HANDLE );
		wp_set_script_translations( self::SCRIPT_HANDLE, 'elementor' );
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

	private function get_widgets(): array {
		return [
			[
				'name' => self::WIDGET_NAME,
				'title' => __( 'Birthday', 'elementor' ),
				'icon' => 'eicon-notification',
				'categories' => '["v4-elements"]',
			],
		];
	}

	private function get_modal_config(): array {
		return $this->has_valid_assets() ? [
			'header' => $this->data['header'],
			'content' => $this->data['content'],
			'hero' => esc_url( $this->data['hero'] ),
			'cta' => $this->data['cta'],
			'lottie' => $this->lottie_data,
		] : [];
	}

	private function get_api_config(): array {
		return [
			EditorAssetsAPI::ASSETS_DATA_URL => 'https://assets.elementor.com/10th-bday/v1/10th-bday.json',
			EditorAssetsAPI::ASSETS_DATA_TRANSIENT_KEY => '_elementor_10th_bday_data',
			EditorAssetsAPI::ASSETS_DATA_KEY => '10th-bday',
		];
	}

	private function has_valid_assets(): bool {
		if ( empty( $this->data ) || ! is_array( $this->lottie_data ) ) {
			return false;
		}

		return isset( $this->data['header'] ) &&
			isset( $this->data['content'] ) &&
			isset( $this->data['hero'] ) &&
			isset( $this->data['cta']['label'] ) &&
			isset( $this->data['cta']['url'] ) &&
			isset( $this->data['time_frame']['start'] ) &&
			isset( $this->data['time_frame']['end'] );
	}

	private function get_lottie_data(): ?array {
		$cached = get_transient( self::LOTTIE_DATA_TRANSIENT_KEY );

		if ( is_array( $cached ) ) {
			return $cached;
		}

		if ( ! isset( $this->data['lottie'] ) ) {
			return null;
		}

		$data = EditorAssetsAPI::do_safe_get_request( $this->data['lottie'] );

		if ( ! is_array( $data ) ) {
			return null;
		}

		$this->set_lottie_data_transient( $data );

		return $data;
	}

	private function init_data( $force_request_assets = false ): void {
		$this->editor_assets_api = new EditorAssetsAPI( $this->get_api_config() );
		$this->data = $this->editor_assets_api->get_assets_data( $force_request_assets );
		$this->lottie_data = $this->get_lottie_data();
	}

	private function should_show_promotion(): bool {
		return (
			$this->does_have_permissions() &&
			$this->has_valid_assets() &&
			self::is_v4_active() &&
			! $this->birthday_promotion_actions->has_visited_cta() &&
			$this->is_promotion_time()
		);
	}

	private static function is_v4_active(): bool {
		return AtomicWidgetsModule::is_active();
	}

	private function is_promotion_time(): bool {
		try {
			$utc = new \DateTimeZone( 'UTC' );
			$start = ( new \DateTimeImmutable( $this->data['time_frame']['start'], $utc ) )->getTimestamp();
			$end = ( new \DateTimeImmutable( $this->data['time_frame']['end'], $utc ) )->getTimestamp();
		} catch ( \Exception $e ) {
			return false;
		}

		$now = time();

		return $now >= $start && $now <= $end;
	}

	private function does_have_permissions(): bool {
		return current_user_can( 'manage_options' );
	}

	private function set_lottie_data_transient( array $value ): bool {
		return set_transient( self::LOTTIE_DATA_TRANSIENT_KEY, $value, HOUR_IN_SECONDS );
	}
}
