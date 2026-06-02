<?php

namespace Elementor\Modules\Promotions\Widgets;

use Elementor\Core\Common\Modules\Ajax\Module as Ajax;
use Elementor\Core\Utils\Assets_Config_Provider;
use Elementor\Core\Utils\Exceptions;
use Elementor\Includes\EditorAssetsAPI;
use Elementor\Modules\AtomicWidgets\Module as AtomicWidgetsModule;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Birthday_Easter_Egg_Promotion {
	const WIDGET_NAME = 'e-birthday-easter-egg';
	const PACKAGE_NAME = 'birthday-easter-egg-modal';
	const SCRIPT_HANDLE = 'elementor-v2-birthday-easter-egg-modal';
	const CTA_VISITED_KEY = '_elementor_10th_bday_cta_visited';
	const SET_CTA_VISITED_AJAX_ACTION = 'birthday_easter_egg_set_cta_visited';
	const VISITED_PARAM = 'visited';

	private EditorAssetsAPI $editor_assets_api;
	private array $data = [];
	private ?array $lottie_data = null;

	public function __construct( $force_request_assets = false ) {
		$this->init_data( $force_request_assets );
	}

	public function register(): void {
		add_filter( 'elementor/editor/localize_settings', fn( $settings ) => $this->add_promotion_data( $settings ) );
		add_action( 'elementor/editor/before_enqueue_scripts', fn() => $this->maybe_enqueue_app() );
		add_action( 'elementor/ajax/register_actions', fn( Ajax $ajax ) => $this->register_ajax_actions( $ajax ) );
	}

	private function register_ajax_actions( Ajax $ajax ): void {
		if ( ! $this->should_show_promotion() ) {
			return;
		}

		$ajax->register_ajax_action( self::SET_CTA_VISITED_AJAX_ACTION, fn( $data ) => $this->ajax_set_cta_visited( $data ) );
	}

	private function ajax_set_cta_visited( array $data ): array {
		if ( ! current_user_can( 'edit_posts' ) ) {
			throw new \Exception( 'forbidden', Exceptions::FORBIDDEN );
		}

		$visited = filter_var( $data[ self::VISITED_PARAM ] ?? null, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE ) ?? true;

		update_user_meta( get_current_user_id(), self::CTA_VISITED_KEY, $visited ? 1 : 0 );

		return [ self::VISITED_PARAM => $visited ];
	}

	private function add_promotion_data( array $settings ): array {
		if ( ! $this->should_show_promotion() ) {
			return $settings;
		}

		$settings['birthdayEasterEggWidgets'] = $this->get_widgets();
		$settings['birthdayEasterEggModal'] = $this->get_modal_config();

		return $settings;
	}

	private function maybe_enqueue_app(): void {
		if ( ! $this->should_show_promotion() ) {
			return;
		}

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
			'hero' => $this->data['hero'],
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
		return $this->data && 
			isset( $this->data['header'] ) &&
			isset( $this->data['content'] ) &&
			isset( $this->data['hero'] ) &&
			isset( $this->data['cta']['label'] ) &&
			isset( $this->data['cta']['url'] ) &&
			isset( $this->data['time_frame']['start'] ) &&
			isset( $this->data['time_frame']['end'] ) &&
			$this->lottie_data;
	}

	private function get_lottie_data(): ?array {
		if ( ! $this->data['lottie'] ) {
			return null;
		}

		if ( $this->lottie_data ) {
			return $this->lottie_data;
		}

		try {
			$response = wp_remote_get( $this->data['lottie'] );

			if ( is_wp_error( $response ) || \WP_Http::OK !== (int) wp_remote_retrieve_response_code( $response ) ) {
				return null;
			}

			return json_decode( wp_remote_retrieve_body( $response ), true );
		} catch ( \Exception $e ) {
			return null;
		}
	}

	private function init_data( $force_request_assets = false ): void {
		$this->editor_assets_api = new EditorAssetsAPI( $this->get_api_config() );
		$this->data = $this->editor_assets_api->get_assets_data( $force_request_assets );
		$this->lottie_data = $this->get_lottie_data();
	}

	private function should_show_promotion(): bool {
		return (
			$this->has_valid_assets() &&
			self::is_v4_active() &&
			! $this->has_visited_cta() &&
			$this->is_promotion_time()
		);
	}

	private static function is_v4_active(): bool {
		return AtomicWidgetsModule::is_active();
	}

	private function is_promotion_time(): bool {
		if ( ! $this->has_valid_assets() ) {
			return false;
		}
	
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

	private function has_visited_cta(): bool {
		return get_user_meta( get_current_user_id(), self::CTA_VISITED_KEY, true ) === '1';
	}
}
